<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchDoc } from '../lib/api'
import type { DocResponse } from '../lib/types'

const route = useRoute()
const data = ref<DocResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isFullscreen = ref(false)

async function load(slug: string) {
  loading.value = true
  error.value = null
  try {
    data.value = await fetchDoc(slug)
  } catch (err: any) {
    error.value = err?.message || 'Failed to load document'
  } finally {
    loading.value = false
  }
}

function syncFullscreen() {
  isFullscreen.value = !!document.fullscreenElement
}

async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  } else {
    await document.documentElement.requestFullscreen()
  }
}

onMounted(() => {
  load(route.params.slug as string)
  document.addEventListener('fullscreenchange', syncFullscreen)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  if (document.fullscreenElement) document.exitFullscreen()
})

watch(
  () => route.params.slug,
  (slug) => slug && load(slug as string)
)
</script>

<template>
  <div v-if="loading" class="state">Loading document…</div>
  <div v-else-if="error" class="state error">{{ error }}</div>
  <article v-else-if="data" class="doc" :class="{ 'is-fullscreen': isFullscreen }">
    <button
      class="fs-toggle"
      type="button"
      :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
      :title="isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'"
      @click="toggleFullscreen"
    >
      <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <header class="doc-head">
      <h1 class="headline doc-title">{{ data.meta.title }}</h1>
      <p v-if="data.meta.description" class="doc-desc">
        {{ data.meta.description }}
      </p>
    </header>
    <div class="doc-body" v-html="data.html" />
  </article>
</template>

<style scoped>
.doc {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
}

.doc.is-fullscreen {
  max-width: 760px;
  padding: 56px 32px 96px;
}

.fs-toggle {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 20;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--muted);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s, color 0.15s, border-color 0.15s;
}

.fs-toggle:hover {
  opacity: 1;
  color: var(--ink);
  border-color: var(--muted);
}

.doc-head {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.doc-title {
  font-size: clamp(36px, 5vw, 52px);
  margin: 0 0 12px;
}

.doc-desc {
  font-size: 18px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

.state {
  padding: 60px 20px;
  text-align: center;
  color: var(--muted);
}

.state.error {
  color: #b04a2e;
}

.doc-body :deep(h1),
.doc-body :deep(h2),
.doc-body :deep(h3),
.doc-body :deep(h4) {
  font-family: var(--font-serif);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin-top: 2em;
  margin-bottom: 0.5em;
  line-height: 1.2;
}

.doc-body :deep(h1) {
  font-size: 36px;
}
.doc-body :deep(h2) {
  font-size: 28px;
}
.doc-body :deep(h3) {
  font-size: 22px;
}
.doc-body :deep(h4) {
  font-size: 18px;
}

.doc-body :deep(h2)::before {
  content: '';
  display: block;
  width: 40px;
  height: 2px;
  background: var(--accent);
  margin-bottom: 16px;
}

.doc-body :deep(p),
.doc-body :deep(li) {
  font-size: 17px;
  line-height: 1.7;
  color: var(--text);
}

.doc-body :deep(p) {
  margin: 1em 0;
}

.doc-body :deep(ul),
.doc-body :deep(ol) {
  padding-left: 22px;
  margin: 1em 0;
}

.doc-body :deep(li) {
  margin: 0.4em 0;
}

.doc-body :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.doc-body :deep(blockquote) {
  border-left: 3px solid var(--accent);
  padding: 4px 18px;
  margin: 1.5em 0;
  color: var(--muted);
  font-style: italic;
}

.doc-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--accent-soft);
  color: var(--accent-deep);
  padding: 2px 6px;
  border-radius: 4px;
}

.doc-body :deep(pre) {
  background: #fbfaf4 !important;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 16px 18px;
  overflow-x: auto;
  margin: 1.5em 0;
  font-size: 14px;
  line-height: 1.6;
}

.doc-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
}

.doc-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 15px;
}

.doc-body :deep(th),
.doc-body :deep(td) {
  border-bottom: 1px solid var(--line);
  padding: 10px 12px;
  text-align: left;
}

.doc-body :deep(th) {
  font-weight: 600;
  color: var(--ink);
  background: var(--bg);
}

.doc-body :deep(hr) {
  border: none;
  height: 1px;
  background: var(--line);
  margin: 2.5em 0;
}

.doc-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}

.doc-body :deep(.header-anchor) {
  color: var(--muted);
  opacity: 0;
  text-decoration: none;
  margin-right: 8px;
  transition: opacity 0.15s;
}

.doc-body :deep(h1:hover .header-anchor),
.doc-body :deep(h2:hover .header-anchor),
.doc-body :deep(h3:hover .header-anchor),
.doc-body :deep(h4:hover .header-anchor) {
  opacity: 1;
}
</style>
