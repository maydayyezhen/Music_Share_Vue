<script setup>

import {onMounted, ref} from "vue";
import {
  apiGetAllSongs,
} from "@/api/song-api.js";
import SongList from "@/components/SongList.vue";
import {Song} from "@/models/song.js";

const songs = ref([{...Song}]);

const getAllSongs = async () => {
  const response = await apiGetAllSongs()
  songs.value = response.data;
}

onMounted(getAllSongs);
</script>

<template>
  <div class="container">
    <SongList :songs="songs" @reload-songs="getAllSongs" />
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* 设置最大高度为视口高度 */
  overflow-y: auto; /* 当内容超出时启用垂直滚动条 */
  overflow-x: hidden; /* 禁止横向滚动 */
}
</style>
