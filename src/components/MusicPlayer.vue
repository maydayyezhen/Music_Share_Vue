<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetAudioFileUrlById, apiGetLrcFileUrlById} from "@/api/song-api.js";
import {onMounted, ref, watch} from "vue";
const currentMusic = useMusicStore();
const audioRef = ref(null);
const lyricsRef = ref(null)
const lyrics = ref([]);
const activeIndex = ref(0)
const showSheet = ref(false);

const showSheetChange = () => {
  showSheet.value = !showSheet.value;
}

const onTimeUpdate = () => {
  const currentTime = audioRef.value.currentTime
  for (let i = 0; i < lyrics.value.length; i++) {
    if (currentTime >= lyrics.value[i].time) {
      activeIndex.value = i
    }
  }
  const container = lyricsRef.value?.$el || lyricsRef.value
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
  if (!currentMusic.currentSong.id) return;
  const res = await fetch(apiGetLrcFileUrlById(currentMusic.currentSong.lyricUrl));
  const text = await res.text()
  lyrics.value = parseLRC(text)
}

const emit = defineEmits(["next-song"]);

const nextSong = () => {
  if (currentMusic.currentPlaylist.length === 1) {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  }
  else
    emit("next-song");
}

const previousSong = () => {
  if (currentMusic.currentPlaylist.length === 1) {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  }
  else
    currentMusic.previousSong();

}

onMounted(() => {
  loadLRC()
  if(currentMusic.currentSong.id)
  audioRef.value.src = apiGetAudioFileUrlById(currentMusic.currentSong.audioUrl);
  if (audioRef.value.src) {
    audioRef.value.addEventListener('ended', nextSong)
  }
})

watch(() => currentMusic.currentSong.audioUrl, (newAudioUrl) => {
  if (newAudioUrl) {
    loadLRC()
    audioRef.value.src = apiGetAudioFileUrlById(newAudioUrl)
    audioRef.value.play();
  }
  else {
    audioRef.value.pause()
    audioRef.value.src = ''
    lyrics.value = [];
  }
})
</script>

<template>
  <!-- 展开式播放器卡片 -->
  <v-card
      v-show="showSheet"
      class="music-player pa-4 mt-6"
      elevation="3"
      rounded="lg"
      width="100%"
  >
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

    <!-- 播放器底部控制条 -->
    <v-row align="center" class="mt-4">
      <v-col cols="12" md="8" class="d-flex align-center justify-between">
        <!-- 展开/折叠按钮 -->
        <v-btn icon variant="text" @click="showSheetChange">
          <span class="material-symbols-outlined">more_up</span>
        </v-btn>

        <!-- 右上角菜单按钮 -->
        <v-menu location="top">
          <template #activator="{ props }">
            <v-btn color="primary" v-bind="props">
              播放列表
            </v-btn>
          </template>
          <v-list>
            <v-list-item
                v-for="thisSong in currentMusic.currentPlaylist"
                :key="thisSong.id"
                @click="currentMusic.setCurrentSong(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))"
            >
              <v-list-item-title
                  :class="{
                  'text-primary': thisSong.id === currentMusic.currentSong.id,
                  'font-weight-bold': thisSong.id === currentMusic.currentSong.id,
                  'font-weight-normal': thisSong.id !== currentMusic.currentSong.id
                }"
              >
                {{ thisSong.title }} - {{ thisSong.artist.name }}
              </v-list-item-title>

              <template #append>
                <v-btn icon variant="text" @click="currentMusic.deleteSongFromPlaylist(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))">
                  <span class="material-symbols-outlined">close</span>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- 上一首 -->
        <v-btn icon variant="text" @click="previousSong">
          <span class="material-symbols-outlined">skip_previous</span>
        </v-btn>

        <!-- 下一首 -->
        <v-btn icon variant="text" @click="nextSong">
          <span class="material-symbols-outlined">skip_next</span>
        </v-btn>
      </v-col>

      <!-- 音频播放控件 -->
      <v-col cols="12" md="4" class="text-md-end text-center">
        <audio
            ref="audioRef"
            controls
            @timeupdate="onTimeUpdate"
            style="width: 100%; max-width: 300px;"
        ></audio>
      </v-col>
    </v-row>
  </v-card>

  <!-- 小播放器按钮 -->
  <v-btn
      v-if="!showSheet"
      elevation="4"
      class="mini-player d-flex align-center justify-space-between px-4"
      height="48"
      @click="showSheetChange"
  >
    <div class="text-subtitle-2 font-weight-medium">
      正在播放：{{ currentMusic.currentSong.title }}
    </div>
    <span class="material-symbols-outlined expand-icon">expand_less</span>
  </v-btn>
</template>




<style scoped>
.lyrics-container {
  background: #222;
  border-radius: 8px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.line {
  color: #ccc;
  font-size: 14px;
  transition: all 0.3s;
  white-space: pre-wrap;
}

.active {
  color: #00ffd5;
  font-weight: bold;
  font-size: 18px;
  background-color: rgba(0, 255, 213, 0.1);
  border-left: 4px solid #00ffd5;
  padding-left: 8px;
}

.mini-player {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  color: #333;
  border-radius: 24px;
  width: auto;
  max-width: 90%;
  min-width: 280px;
}

.expand-icon {
  margin-left: 12px;
}

v-list-item-title {
  font-size: 14px;
}

v-list-item {
  border-bottom: 1px solid #eee;
}

v-btn {
  text-transform: none;
}

</style>
