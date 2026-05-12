#!/usr/bin/env node
import { mkdir, writeFile, access, copyFile, stat } from 'node:fs/promises'
import { basename, isAbsolute, join, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { KNOWN_THEMES, parseArgs, repoRoot, slugify } from './lib/util.mjs'

const ROOT = repoRoot()
const PROJECTS_DIR = join(ROOT, 'projects')

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function prompt(rl, label, fallback) {
  const hint = fallback ? ` (${fallback})` : ''
  const ans = (await rl.question(`${label}${hint}: `)).trim()
  return ans || fallback || ''
}

async function ensureSlug(initial, rl) {
  let slug = slugify(initial || '')
  while (true) {
    if (!slug) {
      slug = slugify(await prompt(rl, 'Slug (folder name)'))
      continue
    }
    const dir = join(PROJECTS_DIR, slug)
    if (await exists(dir)) {
      console.log(`  ! "${slug}" already exists.`)
      slug = slugify(await prompt(rl, 'Try another slug'))
      continue
    }
    return slug
  }
}

function slidesTemplate({ title, description, theme }) {
  const themeLine = theme === 'leland' ? 'theme: ./../../themes/slidev-theme-leland' : `theme: ${theme}`
  return `---
${themeLine}
title: ${JSON.stringify(title)}
${description ? `info: ${JSON.stringify(description)}\n` : ''}class: text-center
highlighter: shiki
transition: slide-left
mdc: true
---

# ${title}

${description || 'A short subtitle for your deck.'}

<!--
Presenter notes go here.
-->

---
layout: section
---

# Section title

A divider between major parts of the deck.

---

## A content slide

- One clear idea per slide
- Cut filler words
- Pictures > paragraphs

\`\`\`ts
// Code blocks are syntax-highlighted
export function greet(name: string) {
  return \`Hello, \${name}\`
}
\`\`\`

---
layout: quote
---

> Make every slide worth a slide.

— **You**, today

---
layout: end
---

# Thank you

questions?
`
}

function docTemplate({ title, description }) {
  return `---
title: ${JSON.stringify(title)}
${description ? `description: ${JSON.stringify(description)}\n` : ''}---

# ${title}

${description || 'A short intro paragraph for this document.'}

## Section

Write long-form markdown here. Headings, lists, **bold**, _italics_, and code blocks all work.

\`\`\`ts
function example() {
  return 'syntax highlighting via Shiki'
}
\`\`\`

## Next section

- Bullet
- Bullet
- Bullet
`
}

function metaJson({ slug, title, description, mode, theme, tags }) {
  const now = new Date().toISOString()
  return {
    slug,
    title,
    description: description || undefined,
    mode,
    theme: mode === 'slides' ? theme : undefined,
    tags: tags && tags.length ? tags : undefined,
    createdAt: now,
    updatedAt: now
  }
}

async function main() {
  const { args } = parseArgs(process.argv.slice(2))
  await mkdir(PROJECTS_DIR, { recursive: true })

  const interactive = !args.slug || !args.title || !args.mode
  const rl = interactive ? createInterface({ input, output }) : null

  try {
    const titleInput = args.title || (rl && (await prompt(rl, 'Title')))
    if (!titleInput) throw new Error('Title is required')

    const slug = await (async () => {
      if (args.slug) return await ensureSlug(args.slug, rl)
      const fallback = slugify(titleInput)
      const ans = rl ? await prompt(rl, 'Slug', fallback) : fallback
      return await ensureSlug(ans, rl)
    })()

    let mode = (args.mode || '').toLowerCase()
    if (mode !== 'slides' && mode !== 'doc') {
      const ans = rl ? await prompt(rl, 'Mode (slides/doc)', 'slides') : 'slides'
      mode = ans.toLowerCase() === 'doc' ? 'doc' : 'slides'
    }

    const description =
      args.description ?? (rl ? await prompt(rl, 'Description (optional)') : '')

    let theme = (args.theme || '').toLowerCase()
    if (mode === 'slides' && !theme) {
      if (rl) {
        console.log('  Themes:')
        KNOWN_THEMES.forEach((t, i) => console.log(`    ${i + 1}. ${t.label} (${t.name})`))
        const ans = await prompt(rl, 'Theme number or name', 'leland')
        const byIndex = Number(ans)
        if (!Number.isNaN(byIndex) && KNOWN_THEMES[byIndex - 1]) {
          theme = KNOWN_THEMES[byIndex - 1].name
        } else {
          theme = ans
        }
      } else {
        theme = 'leland'
      }
    }
    if (mode === 'doc') theme = undefined

    const tags = args.tags
      ? String(args.tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const sourcePaths = []
    if (args.source) {
      const raw = String(args.source)
      const items = raw.includes(',') ? raw.split(',').map((s) => s.trim()) : [raw]
      for (const item of items.filter(Boolean)) {
        const abs = isAbsolute(item) ? item : resolve(process.cwd(), item)
        try {
          const s = await stat(abs)
          if (!s.isFile()) throw new Error('not a file')
          sourcePaths.push(abs)
        } catch (err) {
          throw new Error(`--source: cannot read "${item}" (${err.message})`)
        }
      }
    }

    const dir = join(PROJECTS_DIR, slug)
    await mkdir(dir, { recursive: true })

    const meta = metaJson({ slug, title: titleInput, description, mode, theme, tags })
    await writeFile(join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf-8')

    if (mode === 'slides') {
      await writeFile(
        join(dir, 'slides.md'),
        slidesTemplate({ title: titleInput, description, theme: theme || 'leland' }),
        'utf-8'
      )
    } else {
      await writeFile(
        join(dir, 'doc.md'),
        docTemplate({ title: titleInput, description }),
        'utf-8'
      )
    }

    const copied = []
    if (sourcePaths.length) {
      const sourcesDir = join(dir, 'sources')
      await mkdir(sourcesDir, { recursive: true })
      for (const abs of sourcePaths) {
        const dest = join(sourcesDir, basename(abs))
        await copyFile(abs, dest)
        copied.push(basename(abs))
      }
    }

    console.log('')
    console.log(`  Created  projects/${slug}/`)
    console.log(`           ├─ meta.json`)
    if (copied.length) {
      console.log(`           ├─ ${mode === 'slides' ? 'slides.md' : 'doc.md'}`)
      console.log(`           └─ sources/`)
      copied.forEach((name, i) => {
        const last = i === copied.length - 1
        console.log(`                ${last ? '└─' : '├─'} ${name}`)
      })
    } else {
      console.log(`           └─ ${mode === 'slides' ? 'slides.md' : 'doc.md'}`)
    }
    console.log('')
    if (mode === 'slides') {
      console.log(`  Present  pnpm present ${slug}`)
    }
    console.log(`  Gallery  pnpm dev   →   http://localhost:3030/`)
    console.log('')
  } finally {
    rl?.close()
  }
}

main().catch((err) => {
  console.error(`\n  ✗  ${err.message}\n`)
  process.exit(1)
})
