import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { getProject, projectDir, sourcePath } from './projects'
import type { LaunchResponse } from '../lib/types'

interface RunningDeck {
  port: number
  process: ChildProcess
  url: string
  startedAt: number
}

const running = new Map<string, RunningDeck>()
const STARTING_PORT = 4100

function findFreePort(start: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(start, () => {
      const addr = server.address()
      const port = typeof addr === 'object' && addr ? addr.port : start
      server.close(() => resolve(port))
    })
  })
}

async function nextPort(): Promise<number> {
  let port = STARTING_PORT
  for (let i = 0; i < 100; i++) {
    try {
      return await findFreePort(port + i)
    } catch {
      continue
    }
  }
  throw new Error('No free port found')
}

function waitForReady(child: ChildProcess, port: number, timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('Slidev did not start in time'))
    }, timeoutMs)

    const tryMatch = (chunk: Buffer | string) => {
      const text = chunk.toString()
      // Slidev prints something like:  ›  Local:    http://localhost:3030/
      const m = text.match(/https?:\/\/(?:localhost|127\.0\.0\.1):(\d+)\/?\S*/)
      if (m && !settled) {
        settled = true
        clearTimeout(timer)
        resolve(m[0].replace(/\/$/, ''))
      }
    }

    child.stdout?.on('data', tryMatch)
    child.stderr?.on('data', tryMatch)
    child.on('exit', (code) => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        reject(new Error(`Slidev exited (code ${code}) before ready`))
      }
    })

    // Fallback: assume ready if port-bound after a delay
    setTimeout(() => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        resolve(`http://localhost:${port}`)
      }
    }, 8000)
  })
}

export async function launchDeck(slug: string, workspaceRoot: string): Promise<LaunchResponse> {
  const existing = running.get(slug)
  if (existing && !existing.process.killed) {
    return {
      slug,
      url: existing.url,
      port: existing.port,
      status: 'already-running'
    }
  }

  const meta = await getProject(slug)
  if (!meta) throw new Error(`Project not found: ${slug}`)
  if (meta.mode !== 'slides') throw new Error(`Project ${slug} is not a slide deck`)

  const slidesPath = sourcePath(slug, 'slides')
  if (!existsSync(slidesPath)) throw new Error(`No slides.md for ${slug}`)

  const port = await nextPort()

  const cwd = workspaceRoot
  const relSlides = join('projects', slug, 'slides.md')

  const child = spawn(
    'pnpm',
    ['exec', 'slidev', relSlides, '--port', String(port), '--open', 'false'],
    {
      cwd,
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  child.on('exit', () => {
    running.delete(slug)
  })

  const url = await waitForReady(child, port)

  running.set(slug, {
    port,
    process: child,
    url,
    startedAt: Date.now()
  })

  return { slug, url, port, status: 'started' }
}

export function listRunning(): Array<{ slug: string; url: string; port: number }> {
  return Array.from(running.entries()).map(([slug, r]) => ({
    slug,
    url: r.url,
    port: r.port
  }))
}

export function stopAll() {
  for (const [slug, r] of running) {
    try {
      r.process.kill('SIGTERM')
    } catch {
      // ignore
    }
    running.delete(slug)
  }
}

process.on('exit', stopAll)
process.on('SIGINT', () => {
  stopAll()
  process.exit(0)
})
process.on('SIGTERM', () => {
  stopAll()
  process.exit(0)
})
