<script setup>
import Layout from "@/components/Layout.vue";
import AddSong from "@/components/AddSong.vue";
import {onMounted, ref} from "vue";
import axios from "axios";
const songs = ref([]);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const addOrNot = ref(false);//判断是否显示添加歌曲界面
const editingSong = ref(null);//用于存储被编辑歌曲的数据

const getAllSongs = async () => {
  const url = `${API_BASE_URL}/songs`;
  console.log(`🚀 正在请求: ${url}`);
  const response = await axios.get(`${API_BASE_URL}/songs`);
  songs.value = response.data;
}

const startEditSong = (song) => {
  editingSong.value = {...song};
}

const updateSong = async (id) => {
  const url = `${API_BASE_URL}/songs/${id}`;
  console.log(`🚀 正在请求: ${url}`);
  await axios.put(`${API_BASE_URL}/songs`, editingSong.value);
  await getAllSongs();
  editingSong.value = null;
}

const deleteSong = async (id) => {
  const url = `${API_BASE_URL}/songs/${id}`;
  console.log(`🚀 正在请求: ${url}`);
  await axios.delete(`${API_BASE_URL}/songs/${id}`);
  await getAllSongs();
}

onMounted(getAllSongs);
</script>

<template>
  <Layout/>
  <div class="music-list">
    <h1>音乐库</h1>
    <button @click="addOrNot = true">上传歌曲</button>
    <ul>
      <li v-for="song in songs" :key="song.id">{{song.title}} {{song.artist}} {{song.duration}}
        <button @click="playSong(song.id)">播放</button>
        <button @click="deleteSong(song.id)">删除</button>
        <button @click="startEditSong(song)">更新</button>
        <div v-if="editingSong && editingSong.id === song.id">
          <input type="text" v-model="editingSong.title" placeholder="歌曲名称">
          <input type="text" v-model="editingSong.artist" placeholder="歌手">
          <input type="text" v-model="editingSong.duration" placeholder="时长">
          <button @click="updateSong(editingSong.id)">保存</button>
        </div>
      </li>
    </ul>
  </div>

  <div v-if="addOrNot" class="overlay"></div>
  <AddSong v-if="addOrNot" @close="addOrNot = false"/>
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
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明遮罩层 */
  z-index: 1000; /* 遮罩层在最上面 */
}
</style>