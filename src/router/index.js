import { createRouter, createWebHistory } from 'vue-router'
import AllRunners from '../views/AllRunners.vue'
import YourRunners from '../views/YourRunners.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AllRunners
  },
  {
    path: '/your-runners',
    name: 'your-runners',
    component: YourRunners
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 