<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Album } from "@/models/album.js"
import { Song } from "@/models/song.js"

import { apiGetAlbumByAlbumId, apiGetCoverFileUrlById } from "@/api/album-api.js"
import { apiGetSongsByAlbumId } from "@/api/song-api.js"

import SongList from "@/components/SongList.vue"

const route = useRoute()
const album = ref({ ...Album })
const songs = ref([{ ...Song }])
const activeTab = ref('playlist') // 当前选中的 tab

const getSongsByAlbumId = async (albumId) => {
  const songsResponse = await apiGetSongsByAlbumId(albumId)
  songs.value = songsResponse.data
}

onMounted(async () => {
  const albumsResponse = await apiGetAlbumByAlbumId(route.params.id)
  album.value = albumsResponse.data

  await getSongsByAlbumId(route.params.id)
})

function changeTab(tab) {
  activeTab.value = tab
}
</script>


<template>
  <v-container fluid class="pa-0" max-width="lg">
    <!-- 专辑头部信息 -->
    <v-row align="center" class="mb-6" justify="center">
      <v-col cols="12" md="4" class="text-center">
        <v-img
            :src="apiGetCoverFileUrlById(album.id)"
            alt="专辑封面"
            class="mx-auto rounded-lg elevation-4"
            height="200"
            width="200"
            cover
        ></v-img>
      </v-col>

      <v-col cols="12" md="8" class="d-flex flex-column justify-center">
        <h1 class="text-h4 font-weight-medium mb-2">{{ album.title }}</h1>
        <p class="text-subtitle-1 text-grey-darken-1">发行日期：{{ album.releaseDate }}</p>
      </v-col>
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
        {{ tab === 'playlist' ? '播放列表' : '简介' }}
      </v-btn>
    </v-row>

    <!-- 内容展示区 -->
    <v-row justify="center" class="album-content">
      <v-col v-if="activeTab === 'playlist'" cols="12">
        <SongList :songs="songs" @reload-songs="getSongsByAlbumId(route.params.id)" />
      </v-col>

      <v-col v-else-if="activeTab === 'description'" cols="12" md="10">
        <v-card class="pa-4" elevation="1" rounded="lg">
          <p class="text-body-1 text-grey-darken-2 leading-relaxed">
            {{ album.description }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.leading-relaxed {
  line-height: 1.8;
}
</style>
