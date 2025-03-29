import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import User from '@/components/User.vue'
import Admin from '@/components/Admin.vue'
import MyMusic from '@/components/MyMusic.vue'
import MusicDB from '@/components/MusicDB.vue'
import { useAuthStore } from '@/stores/authStore';

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

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn && to.path !== '/') {
        next('/'); // 未登录且访问受保护页面，重定向到主页
    } else {
        next(); // 其他情况放行
    }
});

export default router;
