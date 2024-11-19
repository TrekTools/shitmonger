import { createRouter, createWebHistory } from 'vue-router'
import AllRunners from '@/views/AllRunners.vue'
import YourRunners from '@/views/YourRunners.vue'
import HelloWorld from '@/components/HelloWorld.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld
  },
  {
    path: '/all-runners',
    name: 'allRunners',
    component: AllRunners
  },
  {
    path: '/your-runners',
    name: 'yourRunners',
    component: YourRunners
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 