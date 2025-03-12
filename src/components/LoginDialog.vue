<template>
    <div class="modal-content">
      <div class="user-admin">
        <!-- 用户按钮 -->
        <h2
            @click="handleClick('user')"
            :class="{'active': role === 'user'}"
        >
          用户
        </h2>
        <!-- 管理员按钮 -->
        <h2
            @click="handleClick('admin')"
            :class="{'active': role === 'admin'}"
        >
          管理员
        </h2>
      </div>
      <!-- 用户名输入框 -->
      <input type="text" placeholder="请输入账号" v-model="username" />
      <!-- 密码输入框 -->
      <input type="password" placeholder="请输入密码" v-model="password" />
      <div class="actions">
        <!-- 登录按钮 -->
        <button @click="authStore.login(); login();">登录</button>
        <!-- 取消按钮，点击关闭弹窗 -->
        <button @click="$emit('close')">取消</button>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import router from "@/router/index.js";
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

// 创建响应式变量保存输入的用户名和密码
const username = ref('')
const password = ref('')
const role = ref('user'); // 默认选择用户

const handleClick = (word) => {
  role.value = word;
  console.log(`${role.value} 被点击了`);
  // 你可以根据点击的角色做进一步的处理
};

// 登录函数：这里只做演示，实际可以调用后端 API
const login = () => {
  console.log(`登录用户名: ${username.value}, 密码: ${password.value}`)
  if(role.value === 'admin') {
    router.push('/admin');
  }
  else {
    router.push('/user');
  }
}
</script>

<style scoped>

.user-admin {
  display: flex;
  gap: 20px; /* 可选，控制两者之间的间距 */
}

/* 设置按钮的基础样式 */
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

.actions button {
  margin: 5px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
