<script setup>
import {onMounted, ref} from 'vue'
import { useRoute } from 'vue-router'

import { Album } from "@/models/album.js"
import { Song } from "@/models/song.js"

import {apiGetCoverFileUrl} from "@/api/album-api.js"
import { apiGetSongById, apiGetAlbumBySongId, apiGetLyric} from "@/api/song-api.js"
import {useMusicStore} from "@/stores/musicStore.js";
import EditMusic from "@/components/SongModal.vue";

const route = useRoute()
const album = ref({ ...Album })
const song = ref({ ...Song })
const activeTab = ref('playlist') // 当前选中的 tab
const lyricsRef = ref(null)
const lyrics = ref([]);
const currentMusic = useMusicStore();
const isSongModalVisible = ref(false)
const selectedSong = ref(null) // 当前要编辑的歌曲


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
  const text = await apiGetLyric(song.value.lyricUrl)
  lyrics.value = parseLRC(text)
}

const togglePlayPause = async (currentSong) => {
  if (currentMusic.currentSong.id === currentSong.id) {
    if (currentMusic.isPlaying) {
      currentMusic.pause();
    } else {
      currentMusic.play();
    }
  } else {
    currentMusic.setCurrentPlayList([song.value]);
    currentMusic.setCurrentAlbumUrlList([albumCoverUrl.value]);
    currentMusic.setCurrentSong(0);
  }
};

function changeTab(tab) {
  activeTab.value = tab
}


// 打开编辑歌曲弹窗
const openEditSongModal = (song) => {
  selectedSong.value = { ...song } // 深拷贝以防止未保存时原数据变动
  isSongModalVisible.value = true
}

const getSongById = async (songId) => {
  const songResponse = await apiGetSongById(songId)
  song.value = songResponse.data
}

const getAlbumBySongId = async (songId) => {
  const albumResponse = await apiGetAlbumBySongId(songId)
  album.value = albumResponse.data
}

const coverImageKey = ref(Date.now());

const refreshCoverImage = () => {
  coverImageKey.value = Date.now()
}
const albumCoverUrl = ref('');
const refreshAll = async () =>{
  await getSongById(route.params.id);
  await getAlbumBySongId(route.params.id);
  albumCoverUrl.value = await apiGetCoverFileUrl(album.value.coverUrl);
  refreshCoverImage();
  await loadLRC();
}

onMounted(async () => {
  await refreshAll();
})

</script>


<template>
  <v-container fluid class="pa-0" max-width="lg">
    <!-- 专辑头部信息 -->
    <v-row align="center" class="mb-6" justify="center">
      <v-col cols="12" md="4" class="text-center">
        <v-img
            :key="coverImageKey"
            :src="albumCoverUrl"
            alt="专辑封面"
            class="mx-auto rounded-lg elevation-4"
            height="200"
            width="200"
            cover
        ></v-img>
      </v-col>

      <v-col cols="12" md="8" class="d-flex flex-column justify-center">
        <h1 class="text-h4 font-weight-medium mb-2">{{ song.title }}</h1>
        <p class="text-subtitle-1 text-grey-darken-1">专辑：{{ album.title }}</p>
        <p class="text-subtitle-1 text-grey-darken-1">发行日期：{{ album.releaseDate }}</p>
      </v-col>

        <v-btn icon variant="text" @click="togglePlayPause(song)">
          <span v-if="currentMusic.currentSong.id===song.id && currentMusic.isPlaying" class="material-symbols-outlined">pause_circle</span>
          <span v-if="currentMusic.currentSong.id!==song.id||!currentMusic.isPlaying" class="material-symbols-outlined">play_arrow</span>
        </v-btn>
        <v-btn icon variant="text" @click="openEditSongModal(song)">
          <span class="material-symbols-outlined">edit</span>
        </v-btn>



    </v-row>

    <v-divider class="my-6" />

    <!-- 中间导航栏 -->
    <v-row justify="center" class="mb-6">
      <v-btn
          v-for="tab in ['playlist', 'description']"
          :key="tab"
          :class="['mx-2', { 'v-btn--active': activeTab === tab }]"
          @click="changeTab(tab)"
          variant="outlined"
          rounded="lg"
          :color="activeTab === tab ? 'primary' : 'grey'"
      >
        {{ tab === 'playlist' ? '歌词' : '评论' }}
      </v-btn>
    </v-row>

    <!-- 内容展示区 -->
    <v-row justify="center" class="album-content">
      <v-col v-if="activeTab === 'playlist'" cols="12">
        <v-sheet
            ref="lyricsRef"
            class="lyrics-container mt-4"
            elevation="1"
            rounded
            color="#FFFFFF"
            style="max-height: 100%; overflow-y: visible;"
        >
          <div
              v-for="(line, index) in lyrics"
              :key="index"
              :class="['line px-2 py-1', { active: index === activeIndex }]"
          >
            {{ line.text }}
          </div>
        </v-sheet>
      </v-col>


      <v-col v-else-if="activeTab === 'description'" cols="12" md="10">
        <v-card class="pa-4" elevation="1" rounded="lg">
          <p class="text-body-1 text-grey-darken-2 leading-relaxed">
            这是评论区
          </p>
        </v-card>
      </v-col>
    </v-row>

    <EditMusic
        v-model:visible="isSongModalVisible"
        :song="selectedSong"
        @close="refreshAll"
    />

  </v-container>
</template>

<style scoped>
.leading-relaxed {
  line-height: 1.8;
}
</style>
