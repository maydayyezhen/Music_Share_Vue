// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false);
    const router = useRouter();
    const login = () => {
        isLoggedIn.value = true;
    };

    const logout = () => {
        // 退出后跳转到首页
        isLoggedIn.value = false;
        router.push('/').then(r => {});
    };

    return { isLoggedIn, login, logout };
});
