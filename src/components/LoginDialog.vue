<script setup>
import { ref } from 'vue'
import router from "@/router/index.js";
import { useAuthStore } from '@/stores/authStore';
import {apiCreateUser, apiGetUserByUsername} from "@/api/user-api.js";
import {User} from "@/models/user.js";

const authStore = useAuthStore();
const emit = defineEmits(['close']);

const username = ref('');
const password = ref('');

const newUser = ref({...User});
const registered = ref(false);

const setRegister = () => {
  registered.value = !registered.value;
}
const register = async () => {
    const response = await apiGetUserByUsername(username.value);
  if (Object.keys(response.data).length > 0) {
      alert('用户名已存在');
    }
    else{
      newUser.value.username = username.value;
      newUser.value.password = password.value;
      newUser.value.nickname = username.value;
      const response = await apiCreateUser(newUser.value);
      if( response.status === 200){
        alert('注册成功');
      }
      registered.value = false;
    }

}

const login = async () => {
  const response = await apiGetUserByUsername(username.value);
  const user = response.data;

  if (Object.keys(user).length > 0) {
    if (user.password === password.value) {
      alert('登录成功');
      authStore.login();
      authStore.saveUser(user);
      emit('close');
      await router.push(`/${user.role}`);
    } else {
      alert('密码错误');
    }
  } else {
    alert('用户名不存在');
  }
}
</script>

<template>
  <div class="modal-content">
    <div v-if="!registered" class="login">
      <h2>登录</h2>
      <input type="text" placeholder="请输入账号" v-model="username" />
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

<style scoped>

/* 默认状态 */
h2 {
  display: inline-block;
  padding: 5px 10px;
  margin: 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
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
