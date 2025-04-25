// src/api/axiosInstance.js
import axios from 'axios';
import {useAuthStore} from "@/stores/authStore.js";

const API_BASE_URL = 'http://localhost:8080'; // 你后端的地址

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// 响应拦截器，处理登录过期、未登录
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // 登录过期或未登录，跳转到登录页
            console.warn('未登录或登录过期，跳转到登录页');
            // 清除前端存储的登录状态（比如 Vuex 或 localStorage）
            const authStore = useAuthStore();
            authStore.logout(); // 清除登录状态（比如 token、用户信息）
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
