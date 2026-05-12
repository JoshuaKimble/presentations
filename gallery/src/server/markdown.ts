import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import Shiki from '@shikijs/markdown-it'

let mdPromise: Promise<MarkdownIt> | null = null

function stripFrontmatter(src: string): string {
  if (!src.startsWith('---')) return src
  const end = src.indexOf('\n---', 3)
  if (end === -1) return src
  return src.slice(end + 4).replace(/^\s*\n/, '')
}

async function build(): Promise<MarkdownIt> {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
  })

  md.use(anchor, {
    permalink: anchor.permalink.linkInsideHeader({
      symbol: '#',
      placement: 'before'
    }),
    slugify: (s: string) =>
      s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
  })

  md.use(
    await Shiki({
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: 'light'
    })
  )

  return md
}

export async function renderMarkdown(source: string): Promise<string> {
  if (!mdPromise) mdPromise = build()
  const md = await mdPromise
  return md.render(stripFrontmatter(source))
}
