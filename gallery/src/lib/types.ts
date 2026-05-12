export type ProjectMode = 'slides' | 'doc'

export interface ProjectMeta {
  slug: string
  title: string
  description?: string
  mode: ProjectMode
  theme?: string
  createdAt?: string
  updatedAt?: string
  tags?: string[]
}

export interface ProjectSummary extends ProjectMeta {
  hasSource: boolean
}

export interface DocResponse {
  meta: ProjectMeta
  html: string
}

export interface LaunchResponse {
  slug: string
  url: string
  port: number
  status: 'started' | 'already-running'
}
