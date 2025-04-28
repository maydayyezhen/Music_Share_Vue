<script setup>
import Layout from "@/components/Layout.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import {useMusicStore} from "@/stores/musicStore.js";
import {onMounted, onUnmounted} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
const musicStore = useMusicStore();
const authStore = useAuthStore();

const handleStorage = (event) => {
  if (event.key === `token` && event.newValue === null && authStore.isLoggedIn) {
      authStore.logout(false);
    }
  if (event.key === `token` && event.newValue !== null && !authStore.isLoggedIn) {
    authStore.autoLogin()
  }
};


onMounted(() => {
  window.addEventListener('storage', handleStorage);
  if(authStore.isLoggedIn)
  authStore.autoLogin()
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
