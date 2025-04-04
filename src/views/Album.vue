<script setup>
import {onMounted, ref} from 'vue'
import{Artist} from "@/models/artist.js";
import {apiGetArtistAvatarFileUrl, apiGetArtistById} from "@/api/artist-api.js";
import {useRoute} from "vue-router";
import {Album} from "@/models/album.js";
import {apiGetAlbumsByArtistId, apiGetCoverFileUrlById, apiGetAlbumsByAlbumId} from "@/api/album-api.js";
import {Song} from "@/models/song.js";
import {apiGetSongsByArtistId, apiGetSongsByAlbumId} from "@/api/song-api.js";
import SongList from "@/components/SongList.vue";
const route = useRoute();
const artist = ref({...Artist})
const album = ref([{...Album}]);
const songs = ref([{...Song}]);

onMounted(async () => {
  const albumsResponse = await apiGetAlbumsByAlbumId(route.params.id);
  album.value = albumsResponse.data;
  const songsResponse = await apiGetSongsByAlbumId(route.params.id);
  songs.value = songsResponse.data;
})

</script>

<template>
  <div class="album-container">
    <!-- 专辑信息 -->
    <div class="album-header">
      <img :src="apiGetCoverFileUrlById(album.id)" alt="专辑封面" class="album-cover"/>
      <div class="album-info">
        <h1>{{ album.title }}</h1>
        <p class="album-bio">简介：{{ album.description }}</p>
        <p class="album-bio">发行日期：{{ album.releaseDate }}</p>
      </div>
    </div>

    <div class="album-list">
      <h2>歌曲列表</h2>
      <div class="album-list">
        <div v-for="song in songs" :key="song.id" class="album-card">
          <p class="album-title">{{ song.title }}</p>
          <p>{{ song.lyrics }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="song-list">
    <SongList :songs="songs" @reload-songs="getSongsByAlbumId(route.params.id)"/>
  </div>
</template>

<style scoped>
.album-container {
  position: fixed;              /* 固定定位，让它贴在视口的左边 */
  top: 100px;                       /* 从顶部开始 */
  left: 0;                      /* 靠左 */
  width: 60%;                   /* 左边宽度（和右边的 .song-list 匹配） */
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
  position: fixed;              /* 固定定位，让它贴在视口的右边 */
  top: 80px;                       /* 从顶部开始 */
  right: 0;                     /* 靠右 */
  width: 40%;                   /* 右边宽度（和左边的 .artist-container 匹配） */
  height: 100vh;                /* 高度撑满整个视口 */
  display: flex;                /* 启用 Flex 布局 */
  flex-direction: column;       /* 垂直排列内容 */
  padding: 5px;                /* 内边距 */
}


/* 歌手信息 */
.album-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ddd;
}

.artist-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ddd;
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

/* 专辑列表 */
.album-list {
  margin-top: 20px;
}

.album-list h2 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #444;
}

/* 专辑网格布局 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

/* 单个专辑卡片 */
.album-card {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  margin: 10px;
}

.album-card:hover {
  transform: scale(1.05);
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