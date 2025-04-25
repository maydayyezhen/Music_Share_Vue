<script setup>
import Layout from "@/components/Layout.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import {useMusicStore} from "@/stores/musicStore.js";
const musicStore = useMusicStore();
</script>

<template>
  <v-app>
    <Layout />
    <v-main>
      <v-container fluid>
        <router-view /> <!-- 主要内容 -->
      </v-container>
    </v-main>
    <v-footer app style="display: flex; justify-content: center; align-items: center;">
      <MusicPlayer @next-song="musicStore.nextSong" />
    </v-footer>
  </v-app>

</template>





<style scoped>
</style>
