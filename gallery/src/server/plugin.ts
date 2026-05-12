import type { Plugin, ViteDevServer } from 'vite'
import { join, resolve } from 'node:path'
import { listProjects, readSource } from './projects'
import { renderMarkdown } from './markdown'
import { launchDeck, listRunning } from './launcher'

function send(res: any, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function workspaceRoot(server: ViteDevServer): string {
  return resolve(server.config.root, '..')
}

export function presentationsServer(): Plugin {
  return {
    name: 'presentations-server',
    configureServer(server) {
      const root = workspaceRoot(server)

      server.middlewares.use('/api/projects', async (req, res, next) => {
        if (req.method !== 'GET') return next()
        try {
          const projects = await listProjects()
          send(res, 200, { projects })
        } catch (err: any) {
          send(res, 500, { error: err?.message || 'Failed to list projects' })
        }
      })

      server.middlewares.use('/api/doc', async (req, res, next) => {
        if (req.method !== 'GET') return next()
        const url = req.url || ''
        const slug = decodeURIComponent(url.replace(/^\//, '').split('?')[0]).trim()
        if (!slug) return send(res, 400, { error: 'Missing slug' })

        try {
          const project = await readSource(slug)
          if (!project) return send(res, 404, { error: `Project not found: ${slug}` })
          if (project.meta.mode !== 'doc') {
            return send(res, 400, { error: `Project ${slug} is not a doc project` })
          }
          const html = await renderMarkdown(project.source)
          send(res, 200, { meta: project.meta, html })
        } catch (err: any) {
          send(res, 500, { error: err?.message || 'Failed to render doc' })
        }
      })

      server.middlewares.use('/api/launch', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const url = req.url || ''
        const slug = decodeURIComponent(url.replace(/^\//, '').split('?')[0]).trim()
        if (!slug) return send(res, 400, { error: 'Missing slug' })

        try {
          const result = await launchDeck(slug, root)
          send(res, 200, result)
        } catch (err: any) {
          send(res, 500, { error: err?.message || 'Failed to launch deck' })
        }
      })

      server.middlewares.use('/api/running', async (req, res, next) => {
        if (req.method !== 'GET') return next()
        try {
          send(res, 200, { running: listRunning() })
        } catch (err: any) {
          send(res, 500, { error: err?.message || 'Failed to list running' })
        }
      })

      // Watch projects/ for changes and trigger a full reload
      const watchPath = join(root, 'projects')
      server.watcher.add(watchPath)
      server.watcher.on('change', (path) => {
        if (path.includes('/projects/')) {
          server.ws.send({ type: 'full-reload', path: '*' })
        }
      })
    }
  }
}
