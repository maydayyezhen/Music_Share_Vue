import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import User from '@/views/User.vue'
import Admin from '@/views/Admin.vue'
import MyMusic from '@/views/MyMusic.vue'
import MusicDB from '@/views/MusicDB.vue'
import UserManage from "@/views/UserManage.vue";
import UserInfo from "@/views/UserInfo.vue";
import { useAuthStore } from '@/stores/authStore';
import Artist from "@/views/Artist.vue";
import Album from "@/views/Album.vue";
import Song from "@/views/Song.vue";


const routes = [
    { path: '/', component: Home },
    { path: '/user', component: User },
    { path: '/admin', component: Admin },
    { path: '/my_music', component: MyMusic },
    { path: '/music_db', component: MusicDB },
    { path: '/user_manage', component: UserManage },
    { path: '/user_info', component: UserInfo },
    { path: "/artist/:id", component: Artist },
    { path: "/album/:id", component: Album },
    { path: "/song/:id", component: Song}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isLoggedIn) {
        // 未登录且访问受保护页面，重定向到主页
        if (to.path !== '/') {
            next('/');
        } else {
            next(); // 如果访问的是主页，继续放行
        }
    } else if (authStore.user.role !== 'admin' && to.path === '/user_manage') {
        // 非管理员访问用户管理页面，重定向到主页
        next('/');
    } else {
        next(); // 其他情况放行
    }
});


export default router;
