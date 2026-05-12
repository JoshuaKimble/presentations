#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot } from './lib/util.mjs'

const ROOT = repoRoot()
const slug = process.argv[2]

if (!slug) {
  console.error('\n  Usage: pnpm present <slug>\n')
  console.error('  Example: pnpm present welcome\n')
  process.exit(1)
}

const slidesPath = join(ROOT, 'projects', slug, 'slides.md')
if (!existsSync(slidesPath)) {
  console.error(`\n  ✗ No slides.md found for "${slug}"`)
  console.error(`    Looked at: ${slidesPath}\n`)
  process.exit(1)
}

const args = ['exec', 'slidev', `projects/${slug}/slides.md`, ...process.argv.slice(3)]

const child = spawn('pnpm', args, {
  cwd: ROOT,
  stdio: 'inherit'
})

child.on('exit', (code) => process.exit(code ?? 0))
