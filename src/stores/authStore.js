// src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";
import {User} from "@/models/user.js";
import {apiGetUserByUsername, apiLogin, apiLogout} from "@/api/user-api.js";

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref(localStorage.getItem('current_user') || '');
    const isLoggedIn = ref(!!localStorage.getItem(`token_${currentUser.value}`)|| false);
    const section = ref(localStorage.getItem(`section_${currentUser.value}`) || '');
    const router = useRouter();

    const user = ref(
        JSON.parse(localStorage.getItem(`user_${currentUser.value}`)) || { ...User }
    );


    const setSection = (newSection) => {
        section.value = newSection;
        localStorage.setItem(`section_${user.value.username}`, section.value);
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

    const login = async (username, password) => {
        const token = await apiLogin(username, password)
        localStorage.setItem(`token_${username}`, token);
        currentUser.value = username;
        localStorage.setItem("current_user", currentUser.value);
        const dataResponse = await apiGetUserByUsername(username);
        const user = dataResponse.data;
        saveUser(user);
        isLoggedIn.value = true;
        alert("登录成功！");
    };
    const logout = async (isNormalLogout) => {
        if (isNormalLogout) {
            try {
                const response = await apiLogout();
                alert(response.data);
            } catch (e) {
                console.error('登出失败', e);
            }
        }
        [`token_${user.value.username}`, `section_${user.value.username}`, `user_${user.value.username}`].forEach(item => localStorage.removeItem(item));
        isLoggedIn.value = false;
        if(currentUser === localStorage.getItem('current_user'))
        {
            currentUser.value = null;
            localStorage.removeItem("current_user");
        }
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
        localStorage.setItem(`user_${user.value.username}`, JSON.stringify(user.value));
    }
    return { isLoggedIn, login, logout, section, setSection, user, fetchUser, saveUser,currentUser};
});
