<script setup>
import Layout from "@/components/Layout.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import {useMusicStore} from "@/stores/musicStore.js";
import {useRouter} from "vue-router";
import {onMounted, onUnmounted} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
const musicStore = useMusicStore();
const authStore = useAuthStore();
const router = useRouter();

const handleStorage = (event) => {
  const currentUser = authStore.user?.username;
  if (event.key === `token_${currentUser}` && event.newValue === null && authStore.isLoggedIn) {
      alert('您已退出登录');
      authStore.logout(false);
    }
};
onMounted(() => {
  window.addEventListener('storage', handleStorage);
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorage);
});
</script>

<template>
  <v-app>
    <Layout />
    <v-main>
      <v-container fluid>
        <router-view /> <!-- 主要内容 -->
      </v-container>
    </v-main>
    <v-footer app style="display: flex; justify-content: center; align-items: center; background-color: transparent">
      <MusicPlayer @next-song="musicStore.nextSong" />
    </v-footer>
  </v-app>

</template>





<style scoped>
</style>
