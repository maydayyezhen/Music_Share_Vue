<script setup>
import {ref} from 'vue'
import router from "@/router/index.js";
import { useAuthStore } from '@/stores/authStore';
import {apiRegister} from "@/api/user-api.js";

const authStore = useAuthStore();

const visible = defineModel('visible')

const username = ref('');
const password = ref('');
const registered = ref(false);

const setRegister = () => {
  registered.value = !registered.value;
}

const register = async () => {
  try {
    const response = await apiRegister(username.value, password.value);
    alert(response.data);
    registered.value = false;
  } catch (error) {
    if (error.response && error.response.data) {
      alert(error.response.data);
    } else {
      alert("注册失败，请稍后重试");
    }
  }
};

const login = async () => {
  try{
    await authStore.login(username.value, password.value);
    await router.push(`/${authStore.user.role}`);
    visible.value = false;
  }
  catch (error) {
    if (error.response && error.response.data) {
      alert(error.response.data);
    }
    localStorage.removeItem("token")
  }
  username.value ='';
  password.value = '';
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
