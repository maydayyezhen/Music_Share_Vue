<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetAudioFileUrl, apiGetLyricFileUrl} from "@/api/song-api.js";
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
const currentMusic = useMusicStore();
const audioRef = ref(null);
const lyricsRef = ref(null)
const lyrics = ref([]);
const activeIndexes = ref([]);
const showSheet = ref(false);
const dialog = ref(false)
const isManuallyScrolled = ref(false);
const sliderTime = ref(0)

let scrollTimeout = null; // 定义滚动定时器
const onScroll = () => {
  if(audioRef.value.paused) return;
  isManuallyScrolled.value = true;

  // 如果之前有滚动定时器，先清除
  clearTimeout(scrollTimeout);

  // 设置一个新的定时器，200ms 后认为用户停止滚动
  scrollTimeout = setTimeout(() => {
    isManuallyScrolled.value = false; // 停止滚动
    console.log('用户停止滚动');
  }, 1000); // 200ms 内没有新地滚动则认为滚动停止
}

const onSheetClick = (time) => {
  audioRef.value.currentTime= time;
  if(audioRef.value.paused)
    audioRef.value.play();
}

const showSheetChange = () => {
  showSheet.value = !showSheet.value;
}

const onTimeUpdate = () => {
  if(!audioRef.value.paused)
    sliderTime.value = audioRef.value.currentTime;

  activeIndexes.value = []
  let currentIndex;
  for (let i = 0; i < lyrics.value.length; i++) {
    if (sliderTime.value >= lyrics.value[i].time) {
      currentIndex= i;
    }
  }
  activeIndexes.value = [currentIndex];

  if (currentIndex > 0 && lyrics.value[currentIndex].time === lyrics.value[currentIndex - 1].time) {
    activeIndexes.value.unshift(currentIndex - 1);
  }

  const container = lyricsRef.value?.$el || lyricsRef.value
  const activeEl = container?.querySelector?.('.active')
  if (activeEl&&!isManuallyScrolled.value) {
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
  const res = await fetch(apiGetLyricFileUrl(currentMusic.currentSong.lyricUrl));
  const text = await res.text()
  lyrics.value = parseLRC(text)
}

const playPause = () => {
  if (audioRef.value.paused) {
    currentMusic.play();
  } else {
    currentMusic.pause();
  }
}

const nextSong = () => {
  if (currentMusic.currentPlaylist.length === 1) {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  }
  else if(currentMusic.currentPlaylist.length > 1)
    currentMusic.nextSong();
}

const previousSong = () => {
  if (currentMusic.currentPlaylist.length === 1) {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  }
  else if(currentMusic.currentPlaylist.length > 1)
    currentMusic.previousSong();

}

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const goToArtist = (artistId) => {
  if (artistId)
  {
    router.push(`/artist/${artistId}`);
    dialog.value=false;
  }
}

const goToAlbum = (albumId) => {
  if (albumId)
  {
    router.push(`/album/${albumId}`);
    dialog.value=false;
  }
}

const goToSong = (songId) => {
  if (songId)
  {
    router.push(`/song/${songId}`);
    dialog.value=false;
  }
}

onMounted(() => {
  currentMusic.setAudio(audioRef.value);
  loadLRC()
  if(currentMusic.currentSong.id)
  audioRef.value.src = apiGetAudioFileUrl(currentMusic.currentSong.audioUrl);
  if (audioRef.value) {
    audioRef.value.addEventListener('ended', nextSong)
  }
})

watch(() => currentMusic.currentSong.audioUrl, (newAudioUrl) => {
  if (newAudioUrl) {
    loadLRC()
    audioRef.value.src = apiGetAudioFileUrl(newAudioUrl)
    currentMusic.play();
  }
  else {
    currentMusic.pause();
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

      <v-btn @click="dialog = true" color="primary">打开播放器</v-btn>

      <!-- 全屏播放器对话框 -->
      <v-dialog
          v-model="dialog"
          fullscreen
          transition="dialog-bottom-transition"
          scrollable
          overlay-color="rgba(0, 0, 0, 0.6)"
      >
        <v-card style="background: rgba(30, 30, 30, 1); color: white; height: 100%;">

          <!-- 模糊背景图 -->
          <v-img
              :src="currentMusic.currentSongCoverUrl"
              class="blur-background"
              cover
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; filter: blur(15px); opacity: 0.3;"
          />

          <!-- 关闭按钮 -->
          <v-btn icon color="white" variant="text" size="small" @click="dialog = false" style="position: absolute; top: 0; right: 0;">
            <v-icon size="28">mdi-close</v-icon>
          </v-btn>

          <v-card-text class="d-flex flex-column align-center" style="height: 100%; padding: 16px 24px;">

            <v-row class="mt-4">
                <v-img
                    :src="currentMusic.currentSongCoverUrl"
                    alt="歌曲封面"
                    class="rounded-lg elevation-6"
                    height="200"
                    width="200"
                    cover
                    style="cursor: pointer;"
                    @click="goToAlbum(currentMusic.currentSong.album.id)"
                >
                </v-img>
            </v-row>
            <v-row>
              <!-- 歌曲标题和歌手 -->
              <div class="text-center mt-2" >
                <div class="text-h6" style="cursor: pointer;font-size: 1.4rem; font-weight: bold;" @click="goToSong(currentMusic.currentSong.id)">
                  {{ currentMusic.currentSong.title || '未知歌曲' }}
                </div>
                <div class="text-subtitle-1 mt-1" style="cursor: pointer;font-size: 1rem; color: #b0bec5;" @click="goToArtist(currentMusic.currentSong.artist.id)">
                  {{ currentMusic.currentSong.artist.name || '未知歌手' }}
                </div>
              </div>
            </v-row>
            <v-row>
              <!-- 歌词部分 -->
              <v-sheet
                  ref="lyricsRef"
                  class="lyrics-container no-scrollbar"
                  color="transparent"
                  style="flex: 1 1 auto; overflow-y: auto; width: 100%; max-width: 600px; min-height: 464px; max-height: 464px; padding: 16px;display: flex; flex-direction: column; align-items: center;margin-top: 0.8% "
                  @scroll="onScroll"
              >
                <div
                    v-for="(line, index) in lyrics"
                    :key="index"
                    :class="['line px-2 py-1', { active: activeIndexes.includes(index) }]"
                    style="transition: all 0.3s; font-size: 1rem;"
                    @dblclick="onSheetClick(line.time)"
                    :style="{ cursor: 'pointer', transition: 'background-color 0.2s' ,userSelect: 'none' }"

                >
                  {{ line.text }}
                </div>
              </v-sheet>
            </v-row>
            <v-row
                justify="center"
                align="center"
                style="flex-wrap: wrap; gap: 16px; margin-top: 1.7%; margin-bottom: 0;"
            >
              <v-label v-if="audioRef.duration && audioRef.duration > 0">
                {{ formatTime(sliderTime) }}
              </v-label>
              <v-label v-else>
                00:00
              </v-label>
              <!-- 播放进度条 -->
              <el-slider
                  v-model="sliderTime"
                  :max="audioRef.duration"
                  :step="1"
                  :show-tooltip="false"
                  :style="{
      width: '300px', /* 增大宽度，改善用户体验 */
      '--el-slider-main-bg-color': '#00ffd5',
      '--el-slider-button-bg-color': '#00ffd5',
      '--el-slider-button-border-color': '#00ffd5',
      '--el-slider-button-size': '12px'
    }"
                  @input="currentMusic.pause();audioRef.currentTime = sliderTime;"
                  @change="currentMusic.play()"
              />
              <!-- 时间标签 -->
              <v-label v-if="audioRef.duration && audioRef.duration > 0">
                {{ formatTime(audioRef.duration) }}
              </v-label>
              <v-label v-else>
                00:00
              </v-label>
            </v-row>
            <v-row justify="center" align="center" style="flex-wrap: wrap; gap: 16px; margin-bottom: 2%; margin-top: 0.5%">
              <v-menu location="top" style="max-width: 100px">
                <template #activator="{ props }">
                  <v-btn icon color="white" variant="text" size="small" v-bind="props">
                    <v-icon size="28">mdi-playlist-music</v-icon>
                  </v-btn>
                </template>
                <v-list
                    style="background: rgba(30, 30, 30, 0.6);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 12px;"
                    class="text-white">

                <v-list-item
                      v-for="thisSong in currentMusic.currentPlaylist"
                      :key="thisSong.id"
                      @click="currentMusic.setCurrentSong(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))"
                  >
                  <v-list-item-title
                      :class="{
      'highlighted-title': thisSong.id === currentMusic.currentSong.id,
      'text-white': thisSong.id !== currentMusic.currentSong.id
    }"
                  >
                    {{ thisSong.title }} - {{ thisSong.artist.name }}
                  </v-list-item-title>

                    <template #append>
                      <v-btn icon color="white" variant="text" size="small" @click="currentMusic.deleteSongFromPlaylist(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))">
                        <v-icon size="20">mdi-close</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn icon color="white" variant="text"  size="small" @click="toggleRepeat">
                <v-icon size="28">mdi-repeat</v-icon>
              </v-btn>
              <v-btn icon color="white" variant="text" size="small" @click="previousSong">
                <v-icon size="28">mdi-skip-previous</v-icon>
              </v-btn>
              <v-btn icon color="white" variant="text" size="small" @click="playPause">
                <v-icon v-if="!currentMusic.isPlaying" size="28">mdi-play</v-icon>
                <v-icon v-else size="28">mdi-pause</v-icon>
              </v-btn>
              <v-btn icon color="white" variant="text" size="small" @click="nextSong">
                <v-icon size="28">mdi-skip-next</v-icon>
              </v-btn>
              <v-menu location="top">
                <template #activator="{ props }">
                  <v-btn icon color="white" variant="text" size="small" v-bind="props">
                    <v-icon size="28">mdi-volume-high</v-icon>
                  </v-btn>
                </template>
                <v-card
                    elevation="5"
                    class="volume-card"
                    style="
    background: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 140px;
  "
                >
                  <el-slider
                      v-model="audioRef.volume"
                      max="1"
                      step="0.01"
                      vertical
                      height="100px"
                      :show-tooltip="false"
                      :style="{
      '--el-slider-main-bg-color': '#00ffd5',
      '--el-slider-button-bg-color': '#00ffd5',
      '--el-slider-button-border-color': '#00ffd5'
    }"
                  />
                </v-card>


              </v-menu>
              <v-btn icon color="white" variant="text" size="small">
                <v-icon size="28">mdi-dots-vertical</v-icon>
              </v-btn>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>





      <!-- 音频播放控件 -->
      <v-col cols="12" md="4" class="text-md-end text-center">
        <audio
            ref="audioRef"
            controls
            @timeupdate="onTimeUpdate"
            @play="currentMusic.isPlaying=true"
            @pause="currentMusic.isPlaying=false"
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
    <div v-if="currentMusic.isPlaying && currentMusic.currentSong.id" class="text-subtitle-2 font-weight-medium">
      正在播放：{{ currentMusic.currentSong.title }} - {{ currentMusic.currentSong.artist.name }}
    </div>

    <div v-else-if="!currentMusic.isPlaying && currentMusic.currentSong.id" class="text-subtitle-2 font-weight-medium">
      已暂停：{{ currentMusic.currentSong.title }} - {{ currentMusic.currentSong.artist.name }}
    </div>

    <div v-else class="text-subtitle-2 font-weight-medium">
      当前没有播放的歌曲
    </div>

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

v-list-item-title {
  font-size: 14px;
}

v-list-item {
  border-bottom: 1px solid #eee;
}

v-btn {
  text-transform: none;
}

.blur-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(30px);
  opacity: 0.4;
  z-index: 1;
}

.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome / Safari / Opera */
}

.no-scrollbar {
  -ms-overflow-style: none;  /* IE & Edge */
  scrollbar-width: none;     /* Firefox */
  overflow-y: auto;          /* 确保可滚动 */
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.highlighted-title {
  color: #00ffd5;
  font-weight: bold;
}


</style>
