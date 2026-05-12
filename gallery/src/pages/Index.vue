<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchProjects } from '../lib/api'
import type { ProjectSummary } from '../lib/types'

const projects = ref<ProjectSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const filter = ref<'all' | 'slides' | 'doc'>('all')

const filtered = computed(() => {
  if (filter.value === 'all') return projects.value
  return projects.value.filter((p) => p.mode === filter.value)
})

const counts = computed(() => ({
  all: projects.value.length,
  slides: projects.value.filter((p) => p.mode === 'slides').length,
  doc: projects.value.filter((p) => p.mode === 'doc').length
}))

onMounted(async () => {
  try {
    projects.value = await fetchProjects()
  } catch (err: any) {
    error.value = err?.message || 'Failed to load projects'
  } finally {
    loading.value = false
  }
})

function formatDate(d?: string): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return d
  }
}
</script>

<template>
  <section class="hero">
    <h1 class="headline">Own the deck.</h1>
    <p class="lede">
      Slideshows and documents — written in markdown, scaffolded from the
      terminal or your AI coding assistant.
    </p>
  </section>

  <div class="toolbar">
    <div class="filters">
      <button
        :class="{ on: filter === 'all' }"
        @click="filter = 'all'"
      >
        All <span class="count">{{ counts.all }}</span>
      </button>
      <button
        :class="{ on: filter === 'slides' }"
        @click="filter = 'slides'"
      >
        Slides <span class="count">{{ counts.slides }}</span>
      </button>
      <button
        :class="{ on: filter === 'doc' }"
        @click="filter = 'doc'"
      >
        Docs <span class="count">{{ counts.doc }}</span>
      </button>
    </div>
    <div class="howto">
      <code>pnpm scaffold</code> or run <code>/new-presentation</code> in Claude Code
    </div>
  </div>

  <div v-if="loading" class="state">Loading projects…</div>
  <div v-else-if="error" class="state error">{{ error }}</div>
  <div v-else-if="filtered.length === 0" class="empty">
    <p class="empty-title">No projects yet.</p>
    <p class="empty-body">
      Run <code>pnpm scaffold</code> in your terminal, or use the
      <code>/new-presentation</code> slash command in Claude Code to scaffold
      your first deck.
    </p>
  </div>

  <ul v-else class="grid">
    <li v-for="p in filtered" :key="p.slug" class="card">
      <component
        :is="p.mode === 'doc' ? 'RouterLink' : 'RouterLink'"
        :to="p.mode === 'doc' ? `/p/${p.slug}` : `/present/${p.slug}`"
        class="card-link"
      >
        <div class="card-head">
          <span class="badge" :data-mode="p.mode">{{
            p.mode === 'slides' ? 'Slides' : 'Document'
          }}</span>
          <span v-if="p.theme" class="theme">{{ p.theme }}</span>
        </div>
        <h2 class="card-title">{{ p.title }}</h2>
        <p v-if="p.description" class="card-desc">{{ p.description }}</p>
        <div class="card-meta">
          <span v-if="p.updatedAt || p.createdAt" class="date">
            {{ formatDate(p.updatedAt || p.createdAt) }}
          </span>
          <span v-if="!p.hasSource" class="warn">Missing source</span>
          <span v-for="tag in p.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </component>
    </li>
  </ul>
</template>

<style scoped>
.hero {
  margin-bottom: 40px;
  max-width: 760px;
}

.headline {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
  color: var(--ink);
}

.lede {
  font-size: 17px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
  max-width: 600px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 6px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 4px;
}

.filters button {
  border: none;
  background: transparent;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.filters button:hover {
  color: var(--text);
}

.filters button.on {
  background: var(--accent);
  color: #fff;
}

.filters button .count {
  font-size: 11px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 6px;
  border-radius: 8px;
}

.filters button.on .count {
  background: rgba(255, 255, 255, 0.2);
}

.howto {
  font-size: 13px;
  color: var(--muted);
}

.howto code {
  background: var(--accent-soft);
  color: var(--accent-deep);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: all 0.18s;
  overflow: hidden;
}

.card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.card-link {
  display: block;
  padding: 22px;
  color: inherit;
  text-decoration: none;
}

.card-link:hover {
  text-decoration: none;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge[data-mode='slides'] {
  background: var(--accent-soft);
  color: var(--accent-deep);
}

.badge[data-mode='doc'] {
  background: #f3efe6;
  color: #6b5417;
}

.theme {
  font-size: 11px;
  color: var(--muted);
  font-family: var(--font-mono);
}

.card-title {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.2;
  margin: 0 0 8px;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.card-desc {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}

.tag {
  background: var(--bg);
  border: 1px solid var(--line);
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
}

.warn {
  color: #b04a2e;
  font-weight: 500;
}

.state,
.empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--muted);
}

.state.error {
  color: #b04a2e;
}

.empty {
  background: var(--card);
  border: 1px dashed var(--line);
  border-radius: var(--radius);
}

.empty-title {
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--ink);
  margin: 0 0 8px;
}

.empty-body {
  font-size: 14px;
  margin: 0 auto;
  max-width: 460px;
  line-height: 1.5;
}

.empty-body code {
  background: var(--accent-soft);
  color: var(--accent-deep);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
