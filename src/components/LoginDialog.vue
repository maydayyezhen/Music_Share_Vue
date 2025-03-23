<template>
    <div class="modal-content">
      <div v-if="!registered" class="login">
      <div class="user-admin">
        <!-- 用户按钮 -->
        <h2 @click="authStore.setRole('user')" :class="{'active': authStore.role === 'user'}">用户</h2>
        <!-- 管理员按钮 -->
        <h2 @click="authStore.setRole('admin')" :class="{'active': authStore.role === 'admin'}">管理员</h2>
      </div>
      <!-- 用户名输入框 -->
      <input type="text" placeholder="请输入账号" v-model="username" />
      <!-- 密码输入框 -->
      <input type="password" placeholder="请输入密码" v-model="password" />
      <div class="login-actions">
        <!-- 登录按钮 -->
        <button @click="login();">登录</button>
        <!-- 取消按钮，点击关闭弹窗 -->
        <button @click="$emit('close')">取消</button>
        <h3 @click="setRegister" :class="{'active': registered}">注册</h3>
      </div>
      </div>
      <div v-else class="register">
        <h3>注册</h3>
        <input type="text" placeholder="请输入账号" v-model="username" />
        <input type="password" placeholder="请输入密码" v-model="password" />
        <div class="register-actions">
        <button @click="register">确认</button>
        <button @click="setRegister">取消</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import router from "@/router/index.js";
import { useAuthStore } from '@/stores/authStore';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
const authStore = useAuthStore();
const emit = defineEmits(['close']);

const username = ref('');
const password = ref('');

// 创建响应式变量保存输入的用户名和密码
const newUser = ref({ username: '', password: '', nickname: ''});
const registered = ref(false);

const setRegister = () => {
  registered.value = !registered.value;
}
const register = async () => {
  console.log(`注册用户名: ${username.value}, 密码: ${password.value}`)
  let user= ref({});
  try {
    const url = `/users/${encodeURIComponent(username.value)}`;
    console.log(`🚀 正在请求: ${url}`);
    const response = await axios.get(`${API_BASE_URL}/users/${encodeURIComponent(username.value)}`);
    user = response.data;
    if (Object.keys(user).length > 0) {
      alert('用户名已存在');
    }
    else{
      newUser.value.username = username.value;
      newUser.value.password = password.value;
      newUser.value.nickname = username.value;
      console.log(`🚀 正在请 求: ${API_BASE_URL}/users`);
      const response = await axios.post(`${API_BASE_URL}/users`, newUser.value);
      console.log("🚀 请求成功:", response.data);
      alert('注册成功');
      registered.value = false;
    }
  } catch (error) {
    console.error("❌ 按用户名查询用户数据失败:", error);
  }
}

const login = async () => {
  console.log(`登录用户名: ${username.value}, 密码: ${password.value}`)
  console.log(`登录角色: ${authStore.role}`)
  let user = ref({});//用户或管理员
  try {
    const url = `/users/${encodeURIComponent(username.value)}`;
    console.log(`🚀 正在请求: ${url}`);
    const response = await axios.get(`${API_BASE_URL}/${authStore.role}s/${encodeURIComponent(username.value)}`);
    user = response.data;
    if (Object.keys(user).length > 0) {
      if (user.password === password.value) {
        alert('登录成功');
        authStore.login();
        authStore.saveUser(user);
        emit('close');
        await router.push(`/${authStore.role}`);
      } else {
        alert('密码错误');
      }
    } else {
      alert('用户名不存在');
    }
  } catch (error) {
    console.error("❌ 按用户名查询用户数据失败:", error);
  }
}
</script>

<style scoped>

.user-admin {
  display: flex;
  gap: 20px; /* 可选，控制两者之间的间距 */
  justify-content: center; /* 水平居中 */
}

/* 默认状态 */
h2 {
  display: inline-block;
  padding: 5px 10px;
  margin: 5px;
  cursor: pointer;
  background-color: #f8d7da; /* 浅红色背景 */
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 悬浮状态 */
h2:hover {
  background-color: #f5c6cb; /* 较深的红色背景 */
  color: white; /* 文本变白 */
}

/* 选中状态 */
h2.active {
  background-color: #dc3545; /* 红色背景 */
  color: white; /* 文本变白 */
}

.login {
  justify-content: center;
}

.login h3{
  color: cornflowerblue;
  cursor: pointer;
}

.login h3:hover {
  color: #a86666;
}


.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 400px; /* 设定固定宽度 */
  height: 300px; /* 设定固定高度 */
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 让模态框有点立体感 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  transform: translate(-50%, -50%); /* 让模态框真正居中 */
  z-index: 2000; /* 使模态框位于前端 */
}


input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}

.login-actions {
  width: 250px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: relative;
}
.login-actions >:last-child {
  position: absolute;
  right: 0;
}

button {
  margin: 5px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
