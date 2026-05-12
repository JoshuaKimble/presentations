<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isIndex = computed(() => route.name === 'index')
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink to="/" class="brand">
        <svg
          class="brand-mark"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="14" height="10" rx="1.5" fill="currentColor" opacity="0.45" />
          <rect x="7" y="9" width="14" height="10" rx="1.5" fill="currentColor" />
        </svg>
        <span class="brand-text">Presentations</span>
      </RouterLink>
      <nav v-if="!isIndex" class="topnav">
        <RouterLink to="/">All projects</RouterLink>
      </nav>
    </header>
    <main class="content">
      <RouterView />
    </main>
    <footer class="footer">
      <span>Built with Slidev</span>
    </footer>
  </div>
</template>
