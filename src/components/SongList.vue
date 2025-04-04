<script setup>
import {ref} from "vue";
import {useMusicStore} from "@/stores/musicStore.js";
import {
  apiDeleteAudioFileBySongId,
  apiDeleteSongById,
  apiGetCoverFileUrlBySongId,
  apiUpdateSong
} from "@/api/song-api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import AddMusic from "@/components/SongModal.vue";
import {useRoute} from "vue-router";

const props = defineProps(['songs']);
const addOrNot = ref(false);//判断是否显示添加歌曲界面
const editingSong = ref(null);//用于存储被编辑歌曲的数据
const currentMusic = useMusicStore();
const authStore = useAuthStore();
const emit = defineEmits(["reloadSongs"]);
const route = useRoute();

const startEditSong = (song) => {
  editingSong.value = {...song};
}

const updateSong = async () => {
  await apiUpdateSong(editingSong.value);
  editingSong.value = null;
  emit("reloadSongs");
}

const deleteSong = async (song) => {
  await apiDeleteAudioFileBySongId(song.id);
  await apiDeleteSongById(song.id);
  emit("reloadSongs");
}

const playSong = (song) => {
  currentMusic.setCurrentSong(song);
};

const onAddMusicClose = () => {
  addOrNot.value = false;
  emit("reloadSongs");
}

const goToArtist = (artistId) => {
  router.push(`/artist/${artistId}`);
}

const goToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
}


</script>

<template>
  <div class="song-list">
    <h2>歌曲列表</h2>
    <button v-if="authStore.user.role === 'admin'" @click="addOrNot = true">上传歌曲</button>
    <ul>
      <li v-for="song in props.songs" :key="song.id">
        <div class="image-container">
          <img :src="apiGetCoverFileUrlBySongId(song.id)" alt="歌曲封面"/>
        </div>
        <div class="song-info">
          <div class="song-title">{{ song.title }}</div>
          <span class="artist-name" @click="goToArtist(song.artist.id)">{{ song.artist.name }}</span>
          <div class="song-meta" @click="goToAlbum(song.album.id)">{{ song.album.title }} | {{ song.duration }}</div>
        </div>
        <button @click="playSong(song)">播放</button>
        <button v-if="authStore.user.role === 'admin'" @click="deleteSong(song)">删除</button>
        <button v-if="authStore.user.role === 'admin'" @click="startEditSong(song)">更新</button>
        <div v-if="editingSong && editingSong.id === song.id">
          <input type="text" v-model="editingSong.title" placeholder="歌曲名称">
          <input type="text" v-model="editingSong.duration" placeholder="时长">
          <button @click="updateSong()">保存</button>
        </div>
      </li>
    </ul>
  </div>
  <AddMusic v-if="addOrNot" @close="onAddMusicClose"/>
</template>

<style scoped>

.song-list {
  display: flex;          /* 让子元素按需求布局 */
  flex-direction: column; /* 竖直排列 */
  width: 100%;            /* 让它填充整个父组件的宽度 */
  height: 100%;           /* 让它填充整个父组件的高度 */
  padding: 20px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;       /* 内容超出时可滚动 */
  box-sizing: border-box; /* 避免 padding 影响整体尺寸 */
}



button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 20px;
}

button:hover {
  background: #2980b9;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #f1f1f1;
}


.image-container {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  margin-right: 15px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}


.song-info {
  flex-grow: 1;
}

.song-info .artist-name {
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
}

.song-info .artist-name:hover {
  text-decoration: underline;
}

.song-info .song-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.song-info .song-meta {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.song-meta:hover{
  text-decoration: underline;
  cursor: pointer;
  color: #3498db;
}

button {
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  opacity: 0.8;
}

.edit-form input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.edit-form button {
  padding: 10px;
  background-color: #2ECC71;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-form button:hover {
  background-color: #27AE60;
}

.add-music-form input {
  padding: 10px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.add-music-form button {
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-music-form button:hover {
  background-color: #2980b9;
}

</style>