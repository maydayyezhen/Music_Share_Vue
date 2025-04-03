// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";
import {User} from "@/models/user.js";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
    const section = ref(localStorage.getItem('section') || '');
    const router = useRouter();
    const user = ref(JSON.parse(localStorage.getItem('user')) || {...User});

    const setSection = (newSection) => {
        section.value = newSection;
        localStorage.setItem('section', section.value);
        if (section.value === 'my_music') {
            router.push('/my_music').then(r => {});
        }
        if (section.value === 'music_db') {
            router.push('/music_db').then(r => {});
        }
        if (section.value === 'user_manage') {
            router.push('/user_manage').then(r => {});
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
        router.push('/').then(r => {});
    };

    const saveUser = (newUser) => {
        user.value = newUser;
        localStorage.setItem('user', JSON.stringify(user.value));
    }
        return { isLoggedIn, login, logout, section, setSection, user, saveUser };
});
