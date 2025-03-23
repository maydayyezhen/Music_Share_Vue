// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false);
    const role =ref("user");
    const section = ref("");
    const router = useRouter();
    const user = ref({ username: '', password: '', nickname: '' });

    const setRole = (newRole) => {
        role.value = newRole;
    }
    const setSection = (newSection) => {
        section.value = newSection;
        if (section.value === 'my_music') {
            router.push('/my_music').then(r => {});
        }
        if (section.value === 'music_db') {
            router.push('/music_db').then(r => {});
        }
    }

    const login = () => {
        isLoggedIn.value = true;
    };
    const logout = () => {
        // 退出后跳转到首页
        isLoggedIn.value = false;
        router.push('/').then(r => {});
    };

    const saveUser = (newUser) => {
        user.value.username= newUser.username;
        user.value.password= newUser.password;
        user.value.nickname= newUser.nickname;
    }
        return { isLoggedIn, login, logout, role, setRole, section, setSection, user, saveUser };
});
