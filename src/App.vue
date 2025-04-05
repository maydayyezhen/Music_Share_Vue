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
      <router-view />
    </v-main>

    <v-footer
        app
    >
      <MusicPlayer v-if="musicStore.currentSong.id"/>
    </v-footer>
  </v-app>
</template>


<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

}
</style>
