<script setup>
import Layout from "@/components/Layout.vue";
import AddMusic from "@/components/SongModal.vue";
import {onMounted, ref} from "vue";
import {musicStore} from "@/stores/musicStore.js";
import {
  apiGetCoverFileUrlBySongId,
  apiDeleteAudioFileBySongId,
  apiDeleteSongById,
  apiGetAllSongs,
  apiUpdateSong
} from "@/api/song-api.js";

const songs = ref([]);
const addOrNot = ref(false);//判断是否显示添加歌曲界面
const editingSong = ref(null);//用于存储被编辑歌曲的数据
const currentMusic = musicStore();

const getAllSongs = async () => {
  const response = await apiGetAllSongs()
  songs.value = response.data;
}

const startEditSong = (song) => {
  editingSong.value = {...song};
}

const updateSong = async () => {
  await apiUpdateSong(editingSong.value);
  await getAllSongs();
  editingSong.value = null;
}

const deleteSong = async (song) => {
  await apiDeleteAudioFileBySongId(song.id);
  await apiDeleteSongById(song.id);
  await getAllSongs();
}

const playSong = (song) => {
  currentMusic.setCurrentSong(song);
  console.log("播放歌曲:", song.title);
};


onMounted(getAllSongs);
</script>

<template>
  <Layout/>
  <div class="music-list">
    <h1>音乐库</h1>
    <button @click="addOrNot = true">上传歌曲</button>
    <ul>
      <li v-for="song in songs" :key="song.id">
        <div class="image-container">
          <img :src="apiGetCoverFileUrlBySongId(song.id)" alt="歌曲封面"/>
        </div>
        {{song.title}} {{song.artist.name}} {{song.album.title}} {{song.duration}}
        <button @click="playSong(song)">播放</button>
        <button @click="deleteSong(song)">删除</button>
        <button @click="startEditSong(song)">更新</button>
        <div v-if="editingSong && editingSong.id === song.id">
          <input type="text" v-model="editingSong.title" placeholder="歌曲名称">
          <input type="text" v-model="editingSong.duration" placeholder="时长">
          <button @click="updateSong()">保存</button>
        </div>
      </li>
    </ul>
  </div>
  <AddMusic v-if="addOrNot" @close="getAllSongs(); addOrNot = false"/>

</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  background: #f3f3f3;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image-container {
  width: 100px;
  height: 100px;
  overflow: hidden; /* 确保超出容器的部分被隐藏 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  background-color: white; /* 设置容器背景为白色 */
  border-radius: 8px; /* 可选: 给容器添加圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); /* 添加立体感的阴影 */
}

.image-container img {
  object-fit: contain; /* 保持图片比例并将其适应容器 */
  width: 100%;
  height: 100%;
}
button {
  margin-left: 10px;
  cursor: pointer;
}
.music-list{
  margin: 0;
  width: 60%;
  text-align: left;
  position: absolute;
  top: 100px;
  left: 0;
}
</style>