<script setup lang="ts">
defineProps<{ author?: string; role?: string }>()
</script>

<template>
  <div class="slidev-layout quote">
    <slot />
    <p v-if="author" class="attribution">
      — <strong>{{ author }}</strong>
      <span v-if="role">, {{ role }}</span>
    </p>
  </div>
</template>
