<script setup>
import {ref} from "vue";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const newSong = ref({ title: '', artist: '', duration: '', fileUrl: '',coverUrl: '' });
const selectedSongFile = ref(null);
const selectedImgFile = ref(null);
const isModalOpen = ref(false);
const imgUrl = ref('');
const modalImageUrl = ref('');
const selectCover = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImgFile.value = file;
    imgUrl.value = URL.createObjectURL(file);
    console.log("📂 选中文件:", file.name);
  } else {
    console.warn("⚠ 没有选中文件");
  }
};
const selectMusic = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedSongFile.value = file;
    console.log("📂 选中文件:", file.name);
  } else {
    console.warn("⚠ 没有选中文件");
  }
}
const emit = defineEmits(['customEvent']);
const upload = async () => {
  const formData = new FormData();
  formData.append('imgFile', selectedImgFile.value);
  formData.append('songFile', selectedSongFile.value);
  const response = await axios.post(`${API_BASE_URL}/file/upload`, formData,{
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const  paths = response.data;
  const normalizePath = (path) => path.replace(/\\/g, '/');
  newSong.value.coverUrl = encodeURIComponent(normalizePath(paths[0]));
  newSong.value.fileUrl = encodeURIComponent(normalizePath(paths[1]));

  await axios.post(`${API_BASE_URL}/songs`, newSong.value);
  alert("上传成功");
  emit('close');
}
const openImage = (url) => {
  modalImageUrl.value = url;
  isModalOpen.value = true;
}
const closeImage = () => {
  isModalOpen.value = false;
}

</script>

<template>
<div class="add-song">
    <h3>Add a new song</h3>
    <input type="text" placeholder="Song title" v-model="newSong.title">
    <input type="text" placeholder="Artist" v-model="newSong.artist">
    <input type="text" placeholder="Duration" v-model="newSong.duration">
    <input type="text" placeholder="File URL" v-model="newSong.fileUrl">
    <input type="text" placeholder="Cover URL" v-model="newSong.coverUrl">

    <div class="file-upload">
      <input type="file" id="fileInputCover" @change="selectCover" class="file-input" />
      <label for="fileInputCover" class="file-label">选择专辑封面</label>
    </div>

    <div class="file-upload">
      <input type="file" id="fileInputMusic" @change="selectMusic" class="file-input" />
      <label for="fileInputMusic" class="file-label">选择音频文件</label>
    </div>

  <div class="album-cover">
      <img v-if="imgUrl" :src="imgUrl" alt="Album Cover" @click="openImage(imgUrl)"/>
      <p v-else>No cover selected</p>
    </div>
    <div v-if="isModalOpen" class="modal" @click="closeImage">
      <img :src="modalImageUrl" class="modal-content" @click.stop alt="专辑封面">
    </div>
    <button @click="upload">Add</button>
    <button @click="$emit('close')"> 退出 </button>
</div>
</template>

<style scoped>
.add-song {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 800px; /* 设定固定宽度 */
  height: 600px; /* 设定固定高度 */
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 让模态框有点立体感 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  transform: translate(-50%, -50%); /* 让模态框真正居中 */
  z-index: 2000; /* 使模态框位于前端 */
}
.add-song h3 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* 隐藏原生的文件输入框 */
.file-input {
  display: none;
}

/* 自定义按钮 */
.file-label {
  padding: 10px 20px;
  background-color: #d3d3d3;
  color: #333;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  text-align: center;
}

.file-label:hover {
  background-color: #b0b0b0;
}

/* 文件选择框的提示样式 */
.file-label:active {
  background-color: #999;
}

.album-cover {
  width: 200px;
  height: 200px;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: absolute;
  top: 50px;
  left: 50px;

  /* 圆角 */
  border-radius: 16px; /* 让它有轻微的圆角 */

  /* 添加阴影，使其更立体 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  /* 平滑过渡效果 */
  transition: box-shadow 0.3s ease-in-out;
}

/* 悬停时增加阴影，使其更有层次感 */
.album-cover:hover {
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
}


.album-cover img {
  max-width: 100%;
  max-height: 100%;
}
/* 模态窗口背景 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 大图 */
.modal-content {
  position: fixed;
  max-width: 80%;
  max-height: 80%;
  border-radius: 8px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-in-out;
}

/* 鼠标悬停时微缩放 */
.modal-content:hover {
  transform: scale(1.05);
}
</style>