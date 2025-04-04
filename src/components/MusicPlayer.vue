<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetAudioFileUrlById} from "@/api/song-api.js";
const currentMusic = useMusicStore();
</script>

<template>
  <div v-if="currentMusic.currentSong.id" class = "music-player">
    <h2>🎧 当前播放: {{ currentMusic.currentSong.title }}</h2>
    <audio :src="apiGetAudioFileUrlById(currentMusic.currentSong.id)" ref="audioPlayer" controls></audio>
  </div>
</template>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 10px;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
</style>