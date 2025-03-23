import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import User from '@/components/User.vue'
import Admin from '@/components/Admin.vue'
import MyMusic from '@/components/MyMusic.vue'
import MusicDB from '@/components/MusicDB.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/user', component: User },
    { path: '/admin', component: Admin },
    { path: '/my_music', component: MyMusic },
    { path: '/music_db', component: MusicDB }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
