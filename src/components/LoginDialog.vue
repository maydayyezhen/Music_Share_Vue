<script setup>
import {ref} from 'vue'
import router from "@/router/index.js";
import { useAuthStore } from '@/stores/authStore';
import {apiCreateUser, apiGetUserByUsername} from "@/api/user-api.js";
import {User} from "@/models/user.js";

const authStore = useAuthStore();

const visible = defineModel('visible')

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
      setRegister();
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
      username.value ='';
      password.value = '';
      visible.value = false;
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
  <v-dialog v-model="visible" max-width="400">
    <v-card class="pa-6">
      <div v-if="!registered">
        <v-card-title class="text-h5 text-center">登录</v-card-title>

        <v-card-text>
          <v-text-field
              label="账号"
              v-model="username"
              prepend-icon="mdi-account"
          ></v-text-field>
          <v-text-field
              label="密码"
              v-model="password"
              type="password"
              prepend-icon="mdi-lock"
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="d-flex justify-space-between">
          <v-btn color="primary" @click="login">登录</v-btn>
          <v-btn color="grey" @click="visible = false">取消</v-btn>
        </v-card-actions>

        <div class="text-center mt-4">
          <v-btn text @click="setRegister">还没有账号？点击注册</v-btn>
        </div>
      </div>

      <div v-else>
        <v-card-title class="text-h5 text-center">注册</v-card-title>

        <v-card-text>
          <v-text-field
              label="账号"
              v-model="username"
              prepend-icon="mdi-account"
          ></v-text-field>
          <v-text-field
              label="密码"
              v-model="password"
              type="password"
              prepend-icon="mdi-lock"
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="d-flex justify-space-between">
          <v-btn color="success" @click="register">确认</v-btn>
          <v-btn color="grey" @click="setRegister">取消</v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
