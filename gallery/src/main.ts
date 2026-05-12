import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'index', component: () => import('./pages/Index.vue') },
    { path: '/p/:slug', name: 'doc', component: () => import('./pages/Doc.vue'), props: true },
    { path: '/present/:slug', name: 'launch', component: () => import('./pages/Launch.vue'), props: true }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
