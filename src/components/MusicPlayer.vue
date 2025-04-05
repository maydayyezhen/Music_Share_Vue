<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetAudioFileUrlById, apiGetLrcFileUrlById} from "@/api/song-api.js";
import {onMounted, ref, watch} from "vue";
const currentMusic = useMusicStore();
const audioRef = ref(null);
const lyricsRef = ref(null)
const lyrics = ref([]);
const activeIndex = ref(0)

const onTimeUpdate = () => {
  const currentTime = audioRef.value.currentTime
  for (let i = 0; i < lyrics.value.length; i++) {
    if (currentTime >= lyrics.value[i].time) {
      activeIndex.value = i
    }
  }
  const container = lyricsRef.value?.$el || lyricsRef.value // 如果 $el 不存在就当它是普通 DOM
  const activeEl = container?.querySelector?.('.active')
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

}

const parseLRC = (lrcText) => {
  return lrcText
      .split('\n')
      .map(line => {
        const match = line.match(/\[(\d+):(\d+\.\d+)](.+)/)
        if (match) {
          const time = parseInt(match[1]) * 60 + parseFloat(match[2])
          return { time, text: match[3] }
        }
        return null
      })
      .filter(Boolean)
}

const loadLRC = async () => {
  const res = await fetch(apiGetLrcFileUrlById(currentMusic.currentSong.id));
  const text = await res.text()
  lyrics.value = parseLRC(text)
}

onMounted(() => {
  loadLRC()
  audioRef.value.src = apiGetAudioFileUrlById(currentMusic.currentSong.id);
})

watch(() => currentMusic.currentSong.id, (newId) => {
  if (newId) {
    loadLRC()
    audioRef.value.src = apiGetAudioFileUrlById(newId)
  }
})
</script>

<template>
  <v-card
      v-if="currentMusic.currentSong.id"
      class="music-player pa-4 mt-6"
      elevation="3"
      rounded="lg"
      width="100%"
  >
    <!-- 播放器头部 -->
    <v-row align="center">
      <v-col cols="12" md="8">
        <h2 class="text-h6 font-weight-medium">
          🎧 当前播放：{{ currentMusic.currentSong.title }}
        </h2>
      </v-col>
      <v-col cols="12" md="4" class="text-md-end text-center">
        <audio
            ref="audioRef"
            controls
            @timeupdate="onTimeUpdate"
            style="width: 100%; max-width: 300px"
        ></audio>
      </v-col>
    </v-row>

    <!-- 歌词区域 -->
    <v-sheet
        ref="lyricsRef"
        class="lyrics-container mt-4"
        height="300"
        elevation="1"
        rounded
        color="#222"
        style="overflow-y: auto;"
    >
      <div
          v-for="(line, index) in lyrics"
          :key="index"
          :class="['line px-2 py-1', { active: index === activeIndex }]"
      >
        {{ line.text }}
      </div>
    </v-sheet>
  </v-card>
</template>



<style scoped>
.lyrics-container {
  background: #222;
  border-radius: 8px;
}
.line {
  color: #eee;
  font-size: 14px;
  transition: all 0.3s;
}
.active {
  color: #00ffd5;
  font-weight: bold;
  font-size: 18px;
}
</style>
