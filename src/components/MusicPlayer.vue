<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetAudioFileUrlById} from "@/api/song-api.js";
const currentMusic = useMusicStore();
</script>

<template>
  <v-card
      v-if="currentMusic.currentSong.id"
      class="music-player pa-4 mt-6"
      elevation="3"
      rounded="lg"
      width="100%"
  >
    <v-row align="center">
      <v-col cols="12" md="8">
        <h2 class="text-h6 font-weight-medium">
          🎧 当前播放：{{ currentMusic.currentSong.title }}
        </h2>
      </v-col>
      <v-col cols="12" md="4" class="text-md-end text-center">
        <audio
            :src="apiGetAudioFileUrlById(currentMusic.currentSong.id)"
            ref="audioPlayer"
            controls
            style="width: 100%; max-width: 300px"
        ></audio>
      </v-col>
    </v-row>
  </v-card>
</template>


<style scoped>
</style>