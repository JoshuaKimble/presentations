import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { presentationsServer } from './src/server/plugin'

export default defineConfig({
  plugins: [vue(), presentationsServer()],
  server: {
    port: 3030,
    strictPort: false
  },
  build: {
    target: 'es2022'
  }
})
