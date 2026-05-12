#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot, parseArgs } from './lib/util.mjs'

const ROOT = repoRoot()
const { args, positional } = parseArgs(process.argv.slice(2))
const slug = positional[0]

if (!slug || args.help) {
  console.error(`
  Export a Slidev deck.

  Usage:
    pnpm export <slug> --pdf            Export to PDF
    pnpm export <slug> --spa            Export to a standalone HTML SPA
    pnpm export <slug> --spa --pdf      Both
    pnpm export <slug> --pdf --output=./exports/foo.pdf
`)
  process.exit(slug ? 0 : 1)
}

const slidesPath = join(ROOT, 'projects', slug, 'slides.md')
if (!existsSync(slidesPath)) {
  console.error(`\n  ✗ No slides.md found for "${slug}"\n`)
  process.exit(1)
}

const exportsDir = join(ROOT, 'exports')
mkdirSync(exportsDir, { recursive: true })

const wantsPdf = args.pdf || (!args.pdf && !args.spa)
const wantsSpa = !!args.spa

function run(cmdArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', cmdArgs, { cwd: ROOT, stdio: 'inherit' })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))))
  })
}

const tasks = []

if (wantsPdf) {
  const out = args.output || join(exportsDir, `${slug}.pdf`)
  tasks.push(run(['exec', 'slidev', 'export', `projects/${slug}/slides.md`, '--output', out]))
}

if (wantsSpa) {
  const outDir = args['spa-output'] || join(exportsDir, slug)
  tasks.push(
    run([
      'exec',
      'slidev',
      'build',
      `projects/${slug}/slides.md`,
      '--out',
      outDir,
      '--base',
      `/${slug}/`
    ])
  )
}

for (const t of tasks) {
  await t
}

console.log('\n  ✓ Export complete\n')
