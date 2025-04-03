<script setup>
import { onMounted, ref } from "vue";
import ArtistModal from "@/components/ArtistModal.vue";
import {apiGetAllArtists,apiGetArtistAvatarFileUrl} from "@/api/artist-api.js";
import {apiCreateAlbum, apiUploadCoverFile} from "@/api/album-api.js";
import {Album} from "@/models/album.js";
import {Artist} from "@/models/artist.js";

const selectedArtist = ref({ ...Artist });
const artists = ref([{ ...Artist }]);

const getAllArtists = async () => {
  const response = await apiGetAllArtists();
  artists.value = response.data;
}
onMounted(getAllArtists);


const newAlbum = ref({...Album});
const selectedImgFile = ref(null);
const imgUrl = ref('');

const triggerFileInput = () => {
  document.getElementById('cover-file-input').click();
};

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


const emit = defineEmits(["close","albumCreated"]);
const upload = async () => {
  const response = await apiUploadCoverFile(selectedImgFile.value);
  const path = response.data;
  const normalizePath = (path) => path.replace(/\\/g, '/');
  newAlbum.value.coverFilename = encodeURIComponent(normalizePath(path));
  newAlbum.value.artist.id = selectedArtist.value.id;
  const listResponse = await apiCreateAlbum(newAlbum.value);
  emit("albumCreated", listResponse.data);
  alert("上传成功");
  emit('close');
}

const isCreating = ref(false);

</script>

<template>
  <div class="modal">
    <div class="add-album">
      <button class="cancel-btn" @click="$emit('close')">×</button>
      <h2>新建专辑</h2>

       <div class="cover-container">
         <img v-if="imgUrl"
             :src="imgUrl"
             alt="Album Cover"
             class="album-preview"
             @click="triggerFileInput"
         />
        <span v-if="!imgUrl" class="upload-text" @click="triggerFileInput">点击上传</span>
        <input id="cover-file-input" type="file" @change="selectCover" accept="image/*" style="display: none;">
       </div>

        <label for="album-name">专辑名</label>
        <input id="album-name" type="text" v-model="newAlbum.title" class="input-field" placeholder="Album Name">
        <label for="artist">选择歌手</label>

        <div class="select-container">
          <div v-if="selectedArtist.id" class="image-container">
            <img :src="apiGetArtistAvatarFileUrl(selectedArtist.id)" alt="歌手头像" />
          </div>
          <select id="artist" v-model="selectedArtist">
            <option value="" disabled selected>请选择或输入歌手</option>
            <option v-for="artist in artists" :key="artist.id" :value="artist">
              {{ artist.name }}
            </option>
          </select>
          <button @click="isCreating=true">+</button>
          <artist-modal v-show="isCreating" @close="isCreating=false; getAllArtists();" />
        </div>
        <label for="description">简介</label>
        <textarea id="description" v-model="newAlbum.description" class="description-textarea" placeholder="Description" ></textarea>
      <label for="release-date">发行日期</label>
      <input id="release-date" type="date" v-model="newAlbum.releaseDate" placeholder="Release Date">
      <button @click="upload" class="upload-btn">确认</button>
    </div>
  </div>
</template>


<style scoped>
/* 弹窗背景 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 弹窗主体样式 */
.add-album {
  background: white;
  width: 500px; /* 适合的宽度 */
  min-height: 800px; /* 设置最小高度 */
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  text-align: center; /* 居中内容 */
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px; /* 让弹窗稍微向下移动 */
}


.cancel-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.cancel-btn:hover {
  color: #000;
}

/* 新建歌手标题样式 */
h2 {
  font-size: 24px;                  /* 适中的字体大小 */
  color: #a86666;
  font-weight: 600;                  /* 加粗，突出显示 */
  text-align: center;               /* 居中对齐 */
  margin-bottom: 20px;               /* 标题与下面内容之间的间距 */
  text-transform: uppercase;         /* 字母大写 */
  letter-spacing: 1px;               /* 字母间距 */
}



/* 专辑封面容器居中 */
.cover-container {
  position: relative;
  width: 150px; /* 增加宽度 */
  height: 150px; /* 增加高度 */
  margin: 0 auto 10px; /* 居中 */
  text-align: center;
  overflow: hidden; /* 确保内容不溢出 */
  border-radius: 8px; /* 可选：圆角效果 */
}

/* 专辑封面样式 */
.album-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证内容完整显示并覆盖区域 */
  border: 2px solid #B0B0B0; /* 浅灰色边框 */
  cursor: pointer;
  transition: transform 0.3s, border-color 0.3s ease-in-out;
}

/* 鼠标悬停时的效果 */
.album-preview:hover {
  transform: scale(1.05); /* 稍微放大效果 */
}


/* "点击上传" 文字居中，改为方形 */
.upload-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(128, 128, 128, 0.8); /* 半透明灰色背景 */
  color: white;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s ease-in-out;
}

/* 悬浮时 */
.upload-text:hover {
  background-color: rgba(128, 128, 128, 1); /* 背景颜色加深 */
  transform: scale(1.05); /* 放大 */
}

/* 点击时 */
.upload-text:active {
  background-color: rgba(128, 128, 128, 0.6); /* 背景变浅 */
  transform: scale(0.95); /* 缩小 */
}

/* 输入框和按钮的公共样式 */
.input-field, .description-textarea, .upload-btn {
  width: 100%;
  padding: 12px 16px;
  margin: 10px 0; /* 间距 */
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 16px;
}

/* 输入框 */
.input-field {
  width: 60%; /* 更紧凑的宽度 */
  padding: 8px 12px;
  font-size: 14px; /* 调整字体 */
}

/* 输入框和文本区域获得焦点时的样式 */
.input-field:focus, .description-textarea:focus {
  border-color: #888888; /* 焦点边框使用中灰色 */
  outline: none;
}

/* 文本区域 */
.description-textarea {
  resize: vertical;
  min-height: 120px;
}

.select-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.image-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

select {
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ddd;
  cursor: pointer;
}

button {
  background-color: #FF5C5C;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #FF7878;
}

/* 上传按钮 */
.upload-btn {
  background: #FF5C5C; /* 鲜艳但不刺眼的红色 */
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 6px;
  transition: background 0.3s, transform 0.3s ease-in-out;
}

/* 悬浮效果 */
.upload-btn:hover {
  background: #FF7878; /* 略微亮一点的红色 */
  transform: scale(1.05); /* 放大按钮 */
}

/* 点击效果 */
.upload-btn:active {
  background: #FF3E3E; /* 更加鲜艳的红色，用于点击时的反馈 */
  transform: scale(0.95); /* 缩小按钮 */
}
input[type="date"] {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  width: 200px; /* 设置宽度 */
  cursor: pointer;
}

input[type="date"]:focus {
  background-color: #ffffff;
}

input[type="date"]::before {
  content: attr(placeholder);
  color: #888;
}

input[type="date"]:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}


/* 为 label 添加间距 */
label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

/* 让整个表单内容居中 */
.add-album {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left; /* 左对齐标签 */
}
</style>