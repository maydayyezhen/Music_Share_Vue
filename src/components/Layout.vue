<script setup>
import LoginDialog from "@/components/LoginDialog.vue";
import {ref} from "vue"; // 引入弹窗组件
import { useAuthStore } from '@/stores/authStore';
import router from "@/router/index.js";
const authStore = useAuthStore();
const dialogVisible = ref(false)

const selectItem = (item) => {
  console.log('选择了:', item);
  if (item === '我的信息')
    router.push('/user_info');
  isOpen.value = false;
};

</script>

<template>
  <v-app-bar app flat height="64" color="#ADD8E6">
    <!-- LOGO / 标题 -->
    <v-toolbar-title class="title-font text-white">
      Music Share
    </v-toolbar-title>

    <!-- Spacer 推右对齐 -->
    <v-spacer />

    <!-- 登录后的导航 -->
    <template v-if="authStore.isLoggedIn">
      <v-btn
          variant="text"
          class="nav-btn"
          :class="{ active: authStore.section === 'music_db' }"
          @click="authStore.setSection('music_db')"
      >
        音乐库
      </v-btn>

      <v-btn
          v-if="authStore.user.role === 'user'"
          variant="text"
          class="nav-btn"
          :class="{ active: authStore.section === 'my_music' }"
          @click="authStore.setSection('my_music')"
      >
        我的音乐
      </v-btn>

      <v-btn
          v-if="authStore.user.role === 'admin'"
          variant="text"
          class="nav-btn"
          :class="{ active: authStore.section === 'user_manage' }"
          @click="authStore.setSection('user_manage')"
      >
        用户管理
      </v-btn>

      <!-- 菜单按钮 -->
      <v-menu  offset-y>
        <template #activator="{ props }">
          <v-btn
              icon
              v-bind="props"
              variant="text"
              class="d-flex align-center justify-center"
              style="padding: 0;"
          >
            <v-avatar size="32">
              <v-img v-if="authStore.user.avatarUrl"
                     :src="authStore.user.avatarUrl"
                     height="50"
                     width="50"
                     cover></v-img>
              <v-icon v-else size="50" color="grey">mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
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
      <span class="nav-btn text-white font-weight-medium mr-2">{{ authStore.user.nickname }}</span>



    </template>

    <!-- 未登录 -->
    <v-btn v-else color="secondary" @click="dialogVisible = true">登录</v-btn>
  </v-app-bar>

  <!-- 登录弹窗 -->
  <LoginDialog v-model:visible="dialogVisible" />
</template>

<style scoped>
.title-font {
  font-family: 'Lobster', cursive;
  font-size: 24px;
}

.nav-btn {
  color: white;
  text-transform: none;
  font-weight: 500;
}

.nav-btn.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}
</style>
