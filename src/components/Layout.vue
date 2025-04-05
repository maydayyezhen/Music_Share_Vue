<script setup>
import LoginDialog from "@/components/LoginDialog.vue";
import {ref} from "vue"; // 引入弹窗组件
import { useAuthStore } from '@/stores/authStore';
import router from "@/router/index.js";
const authStore = useAuthStore();
const dialogVisible = ref(false)
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
  <v-app-bar app color="#ADD8E6" elevation="0" flat>
    <v-toolbar-title style="font-family: 'Lobster', cursive; color: #FFFFFF">
      Music Share
    </v-toolbar-title>


    <!-- 右侧导航项 -->
    <v-spacer />

    <!-- 登录后显示的导航链接 -->
    <template v-if="authStore.isLoggedIn">
      <v-btn
          text
          @click="authStore.setSection('music_db')"
          :class="{'text--white': authStore.section === 'music_db'}"
      >
        音乐库
      </v-btn>

      <v-btn
          v-if="authStore.user.role === 'user'"
          text
          @click="authStore.setSection('my_music')"
          :class="{'text--white': authStore.section === 'my_music'}"
      >
        我的音乐
      </v-btn>

      <v-btn
          v-if="authStore.user.role === 'admin'"
          text
          @click="authStore.setSection('user_manage')"
          :class="{'text--white': authStore.section === 'user_manage'}"
      >
        用户管理
      </v-btn>

      <!-- 右上角菜单按钮 -->
      <v-menu v-model="isOpen" offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" text>菜单</v-btn>
        </template>
        <v-list>
          <v-list-item @click="selectItem('我的信息')">
            <v-list-item-title>我的信息</v-list-item-title>
          </v-list-item>
          <v-list-item @click="selectItem('设置')">
            <v-list-item-title>设置</v-list-item-title>
          </v-list-item>
          <v-list-item @click="authStore.logout">
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- 未登录时显示登录按钮 -->
    <v-btn v-else color="primary" @click="dialogVisible = true">登录</v-btn>
  </v-app-bar>

  <!-- 登录弹窗 -->
  <LoginDialog v-model:visible="dialogVisible" />
</template>

<style scoped>
</style>