// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
    const role = ref(localStorage.getItem('role') || 'user');
    const section = ref(localStorage.getItem('section') || '');
    const router = useRouter();
    const user = ref(JSON.parse(localStorage.getItem('user')) || { username: '', password: '', nickname: '' });

    const setRole = (newRole) => {
        role.value = newRole;
        localStorage.setItem('role', role.value);
    }
    const setSection = (newSection) => {
        section.value = newSection;
        localStorage.setItem('section', section.value);
        if (section.value === 'my_music') {
            router.push('/my_music').then(r => {});
        }
        if (section.value === 'music_db') {
            router.push('/music_db').then(r => {});
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
        user.value.username= newUser.username;
        user.value.password= newUser.password;
        user.value.nickname= newUser.nickname;
        localStorage.setItem('user', JSON.stringify(user.value));
    }
        return { isLoggedIn, login, logout, role, setRole, section, setSection, user, saveUser };
});
