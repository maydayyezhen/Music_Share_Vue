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
  <v-container class="container">
    <SongList :songs="songs" @reload-songs="getAllSongs" />
  </v-container>
</template>

<style scoped>
</style>
