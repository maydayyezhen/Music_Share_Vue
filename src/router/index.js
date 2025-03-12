import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import User from '@/components/User.vue'
import Admin from '@/components/Admin.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/user', component: User },
    { path: '/admin', component: Admin }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
