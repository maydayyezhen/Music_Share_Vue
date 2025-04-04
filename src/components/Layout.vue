<script setup>
import LoginDialog from "@/components/LoginDialog.vue";
import {ref} from "vue"; // 引入弹窗组件
import { useAuthStore } from '@/stores/authStore';
import router from "@/router/index.js";
const authStore = useAuthStore();
const showLogin = ref(false)
const closeLogin = () => {
  showLogin.value = false // 设置 showLogin 为 false，隐藏登录组件
}
const isOpen = ref(false);
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
}

const selectItem = (item) => {
  console.log('选择了:', item);
  if (item === '我的信息')
    router.push('/user_info');
  isOpen.value = false;
};

</script>
<template>
    <!-- 顶部导航栏 -->
    <header class="header">
      <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet">
      <h1>Music Share</h1>
      <div v-if="authStore.isLoggedIn" class="nav-links">
        <h3 @click="authStore.setSection('music_db')" :class="{'active': authStore.section === 'music_db'}">音乐库</h3>
        <h3 v-if="authStore.user.role==='user'" @click="authStore.setSection('my_music')" :class="{'active': authStore.section === 'my_music'}">我的音乐</h3>
        <h3 v-if="authStore.user.role==='admin'" @click="authStore.setSection('user_manage')" :class="{'active': authStore.section === 'user_manage'}">用户管理</h3>
      </div>
      <button v-if="!authStore.isLoggedIn" class="login-button" @click="showLogin = true">登录</button>
      <button v-else class="login-button"  @click="toggleMenu">菜单</button>
      <!-- 下拉菜单 -->
      <ul v-if="isOpen" class="menu">
        <li @click="selectItem('我的信息')">我的信息</li>
        <li @click="selectItem('设置')">设置</li>
        <li @click="authStore.logout">退出登录</li>
      </ul>
    </header>
  <!-- 遮罩层 -->
  <div v-if="showLogin" class="overlay" @click="closeLogin"></div>
  <!-- 登录弹窗 -->
  <LoginDialog v-if="showLogin" @close="showLogin = false" />
</template>

<style scoped>
.header {
  background: #f7f7f7; /* 浅灰色背景 */
  color: #a86666;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  border-bottom: 2px solid #f0f0f0; /* 底部边框 */
}

.nav-links {
  display: flex; /* 让 h3 们水平排列 */
  gap: 20px; /* h3 之间的间距 */
  margin-left: 40px; /* 调整 h3 离 h1 的距离 */
  margin-right: auto; /* 关键：让它推到左侧 */
  font-size: 1.1rem;
}

h3{
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  background-color: #f8d7da; /* 浅红色背景 */
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}
/* 悬浮状态 */
h3:hover {
  background-color: #f5c6cb; /* 较深的红色背景 */
  color: white; /* 文本变白 */
}



header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-family: 'Lobster', cursive;
}

.login-button {
  padding: 10px 20px;
  background-color: #FF4081; /* 按钮颜色 */
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px; /* 圆角 */
  transition: background-color 0.3s ease, transform 0.2s ease; /* 按钮过渡效果 */
}

.login-button:hover {
  background-color: #F50057; /* 悬停效果 */
  transform: scale(1.05); /* 放大效果 */
}

.login-button:active {
  transform: scale(1); /* 点击效果 */
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明遮罩层 */
  z-index: 1000; /* 遮罩层在最上面 */
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  list-style: none;
  padding: 0;
  margin: 5px 0;
  width: 120px;
}
.menu li {
  padding: 10px;
  cursor: pointer;  /* 鼠标变为手形 */
  transition: background 0.3s ease-in-out;
}

.menu li:hover {
  background: #f0f0f0;  /* 悬停时变成浅灰色 */
  color: #333;  /* 文字颜色稍微变深 */
}

</style>