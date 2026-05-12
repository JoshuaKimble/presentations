import type { DocResponse, LaunchResponse, ProjectSummary } from './types'

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) msg = body.error
    } catch {
      // ignore
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const res = await fetch('/api/projects')
  const data = await jsonOrThrow<{ projects: ProjectSummary[] }>(res)
  return data.projects
}

export async function fetchDoc(slug: string): Promise<DocResponse> {
  const res = await fetch(`/api/doc/${encodeURIComponent(slug)}`)
  return jsonOrThrow<DocResponse>(res)
}

export async function launchDeck(slug: string): Promise<LaunchResponse> {
  const res = await fetch(`/api/launch/${encodeURIComponent(slug)}`, {
    method: 'POST'
  })
  return jsonOrThrow<LaunchResponse>(res)
}
