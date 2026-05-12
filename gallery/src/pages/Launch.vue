<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { launchDeck } from '../lib/api'

const route = useRoute()
const router = useRouter()
const status = ref<string>('Booting Slidev…')
const error = ref<string | null>(null)
const url = ref<string | null>(null)

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    status.value = `Launching ${slug}…`
    const result = await launchDeck(slug)
    url.value = result.url
    status.value =
      result.status === 'already-running'
        ? 'Already running — opening…'
        : 'Ready — opening…'
    // Hand off to the Slidev URL in a new tab and bounce back to index
    window.open(result.url, '_blank', 'noopener')
    setTimeout(() => router.replace('/'), 400)
  } catch (err: any) {
    error.value = err?.message || 'Failed to launch'
  }
})
</script>

<template>
  <div class="launch">
    <div v-if="error" class="error">
      <h2 class="title">Couldn't start the deck.</h2>
      <p>{{ error }}</p>
      <RouterLink to="/" class="back">← Back to gallery</RouterLink>
    </div>
    <div v-else class="loading">
      <div class="spinner" />
      <p class="status">{{ status }}</p>
      <p v-if="url" class="hint">
        If your browser blocked the new tab,
        <a :href="url" target="_blank" rel="noopener">open the deck</a>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.launch {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading,
.error {
  text-align: center;
  max-width: 420px;
}

.title {
  font-family: var(--font-serif);
  color: var(--ink);
  font-size: 28px;
  margin: 0 0 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status {
  color: var(--text);
  font-size: 15px;
  margin: 0 0 8px;
}

.hint {
  color: var(--muted);
  font-size: 13px;
  margin: 12px 0 0;
}

.error {
  color: #b04a2e;
}

.back {
  display: inline-block;
  margin-top: 14px;
  color: var(--accent);
}
</style>
