// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";
import {User} from "@/models/user.js";
import { apiGetUserByUsername } from "@/api/user-api.js";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
    const section = ref(localStorage.getItem('section') || '');
    const router = useRouter();
    const user = ref(JSON.parse(localStorage.getItem('user')) || {...User});

    const setSection = (newSection) => {
        section.value = newSection;
        localStorage.setItem('section', section.value);
        if (section.value === 'my_music') {
            router.push('/my_music').catch(() => {});
        }
        if (section.value === 'music_db') {
            router.push('/music_db').catch(() => {});
        }
        if (section.value === 'user_manage') {
            router.push('/user_manage').catch(() => {});
        }
    }

    const login = () => {
        isLoggedIn.value = true;
        localStorage.setItem('isLoggedIn', isLoggedIn.value);
        console.log(isLoggedIn.value);
    };
    const logout = () => {
        // 退出后跳转到首页
        isLoggedIn.value = false;
        // 清理 localStorage 中的所有用户数据
        ['isLoggedIn','role','section','user'].forEach(item => localStorage.removeItem(item));
        router.push('/').catch(() => {});
    };
    const fetchUser = async (name) => {
        try {
            const response = await apiGetUserByUsername(name);
            console.log('API响应:', response); 
            user.value = response.data; 
            saveUser(user.value); 
        } catch (error) {
            console.error('获取用户数据失败:', error);
            throw error; 
        }
    }
    const saveUser = (newUser) => {
        user.value = newUser;
        localStorage.setItem('user', JSON.stringify(user.value));
    }
    return { isLoggedIn, login, logout, section, setSection, user, fetchUser, saveUser };
});
