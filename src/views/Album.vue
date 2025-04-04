<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Album } from "@/models/album.js"
import { Song } from "@/models/song.js"

import { apiGetAlbumsByAlbumId, apiGetCoverFileUrlById } from "@/api/album-api.js"
import { apiGetSongsByAlbumId } from "@/api/song-api.js"

import SongList from "@/components/SongList.vue"

const route = useRoute()
const album = ref({ ...Album })
const songs = ref([{ ...Song }])
const activeTab = ref('playlist') // 当前选中的 tab

onMounted(async () => {
  const albumsResponse = await apiGetAlbumsByAlbumId(route.params.id)
  album.value = albumsResponse.data

  const songsResponse = await apiGetSongsByAlbumId(route.params.id)
  songs.value = songsResponse.data
})

function changeTab(tab) {
  activeTab.value = tab
}
</script>


<template>
  <div class="album-container">
    <!-- 专辑头部信息 -->
    <div class="album-header">
      <img :src="apiGetCoverFileUrlById(album.id)" alt="专辑封面" class="album-cover" />
      <div class="album-info">
        <h1>{{ album.title }}</h1>
        <p class="album-bio">发行日期：{{ album.releaseDate }}</p>
      </div>
    </div>

    <!-- 中间导航栏 -->
    <div class="album-nav">
      <button :class="{ active: activeTab === 'playlist' }" @click="changeTab('playlist')">播放列表</button>
      <button :class="{ active: activeTab === 'description' }" @click="changeTab('description')">简介</button>
    </div>

    <!-- 内容展示区 -->
    <div class="album-content">
      <div v-if="activeTab === 'playlist'" class="song-list">
        <SongList :songs="songs" @reload-songs="getSongsByAlbumId(route.params.id)" />
      </div>
      <div v-else-if="activeTab === 'description'" class="album-description">
        <p>{{ album.description }}</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
.album-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.album-nav button {
  padding: 10px 20px;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}

.album-nav button.active {
  background-color: #666;
  color: #fff;
}

.album-content {
  padding: 0 20px;
}

.album-description {
  text-indent: 32px;
  font-size: 16px;
  color: #555;
  line-height: 1.6;
}

.album-container {
  position: fixed;              /* 固定定位，让它贴在视口的左边 */
  top: 100px;                       /* 从顶部开始 */
  left: 0;                      /* 靠左 */
  width: 100%;                   /* 左边宽度（和右边的 .song-list 匹配） */
  height: 100vh;                /* 高度撑满整个视口 */
  display: flex;                /* 启用 Flex 布局 */
  flex-direction: column;       /* 垂直排列内容 */
  padding: 5px;                /* 内边距 */
  box-sizing: border-box;       /* 包括 padding 在内计算宽高 */
  background-color: #f9f9f9;    /* 背景色 */
  overflow-y: auto;             /* 内容过多时出现滚动条 */
  z-index: 1;                   /* 层级低于 .song-list */
}

.song-list {
  /* 固定定位，让它贴在视口的右边 */
  top: 80px;                       /* 从顶部开始 */
  right: 0;                     /* 靠右 */
  width: 100%;                   /* 右边宽度（和左边的 .artist-container 匹配） */
  height: 100vh;                /* 高度撑满整个视口 */
  display: flex;                /* 启用 Flex 布局 */
  flex-direction: column;       /* 垂直排列内容 */
  padding: 0px;                 /* 内边距 */
  background-color: #f9f9f9;
}


/* 歌手信息 */
.album-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ddd;
  background-color: #f9f9f9;
}



.album-info {
  flex: 1;
}

h1 {
  font-size: 26px;
  margin-bottom: 5px;
  color: #333;
}

.album-bio {
  font-size: 16px;
  color: #666;
}



.album-list h2 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #444;
}

/* 专辑封面 */
.album-cover {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  object-fit: contain; /* 保持完整，不裁剪 */
  background-color: #f0f0f0; /* 可以设置背景色填充空白 */
}

/* 专辑名称 */
.album-title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #555;
}
</style>