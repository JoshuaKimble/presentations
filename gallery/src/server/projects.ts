import { readdir, readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ProjectMeta, ProjectSummary } from '../lib/types'

export const PROJECTS_ROOT = join(process.cwd(), '..', 'projects')

export function projectDir(slug: string): string {
  return join(PROJECTS_ROOT, slug)
}

export function sourcePath(slug: string, mode: 'slides' | 'doc'): string {
  return join(projectDir(slug), mode === 'slides' ? 'slides.md' : 'doc.md')
}

async function readMeta(slug: string): Promise<ProjectMeta | null> {
  const metaPath = join(projectDir(slug), 'meta.json')
  if (!existsSync(metaPath)) return null
  try {
    const raw = await readFile(metaPath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<ProjectMeta>
    if (!parsed.title || !parsed.mode) return null
    return {
      slug,
      title: parsed.title,
      description: parsed.description,
      mode: parsed.mode,
      theme: parsed.theme,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
      tags: parsed.tags
    }
  } catch {
    return null
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  if (!existsSync(PROJECTS_ROOT)) return []
  const entries = await readdir(PROJECTS_ROOT, { withFileTypes: true })
  const projects: ProjectSummary[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue

    const meta = await readMeta(entry.name)
    if (!meta) continue

    const source = sourcePath(entry.name, meta.mode)
    const hasSource = existsSync(source)
    projects.push({ ...meta, hasSource })
  }

  projects.sort((a, b) => {
    const ad = a.updatedAt || a.createdAt || ''
    const bd = b.updatedAt || b.createdAt || ''
    if (ad && bd) return bd.localeCompare(ad)
    return a.title.localeCompare(b.title)
  })

  return projects
}

export async function getProject(slug: string): Promise<ProjectMeta | null> {
  return readMeta(slug)
}

export async function readSource(slug: string): Promise<{ meta: ProjectMeta; source: string } | null> {
  const meta = await readMeta(slug)
  if (!meta) return null
  const path = sourcePath(slug, meta.mode)
  if (!existsSync(path)) return null
  const source = await readFile(path, 'utf-8')
  return { meta, source }
}

export async function projectMtime(slug: string): Promise<number> {
  const dir = projectDir(slug)
  if (!existsSync(dir)) return 0
  try {
    const s = await stat(dir)
    return s.mtimeMs
  } catch {
    return 0
  }
}
