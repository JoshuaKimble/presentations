import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export function repoRoot() {
  const here = dirname(fileURLToPath(import.meta.url))
  return resolve(here, '..', '..')
}

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseArgs(argv) {
  const args = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        args[key] = true
      } else {
        args[key] = next
        i++
      }
    } else {
      positional.push(a)
    }
  }
  return { args, positional }
}

export const KNOWN_THEMES = [
  { name: 'leland', package: 'slidev-theme-leland', label: 'Leland (custom)' },
  { name: 'default', package: '@slidev/theme-default', label: 'Slidev default' },
  { name: 'seriph', package: '@slidev/theme-seriph', label: 'Slidev seriph (editorial serif)' }
]
