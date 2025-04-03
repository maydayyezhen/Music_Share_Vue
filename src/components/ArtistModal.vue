<script setup>
import {ref} from "vue";
import {apiCreateArtist, apiUploadAvatarFile} from "@/api/artist-api.js";
import {Artist} from "@/models/artist.js";

const newArtist = ref({...Artist});

const selectedImgFile = ref(null);
const imgUrl = ref('');

const triggerFileInput = () => {
  document.getElementById('avatar-file-input').click();
};

const selectAvatar = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImgFile.value = file;
    imgUrl.value = URL.createObjectURL(file);
    console.log("📂 选中文件:", file.name);
  } else {
    console.warn("⚠ 没有选中文件");
  }
};

const emit = defineEmits(["close","artist-created"]);
const upload = async () => {
  const response = await apiUploadAvatarFile(selectedImgFile.value);
  newArtist.value.avatarFilename = response.data;

  const listResponse = await apiCreateArtist(newArtist.value);
  const createdArtist = listResponse.data;
  emit('artist-created', createdArtist);

  alert("上传成功");
  emit('close');
}

</script>

<template>
  <div class="modal">
    <div class="add-artist">
      <button class="cancel-btn" @click="$emit('close')">×</button>
      <h2>新建歌手</h2>
      <div class="cover-container">
        <img v-if="imgUrl" :src="imgUrl" alt="Avatar" class="avatar-preview" @click="triggerFileInput">
        <span v-if="!imgUrl" class="upload-text" @click="triggerFileInput">点击上传</span>
        <input id="avatar-file-input" type="file" @change="selectAvatar" accept="image/*" style="display: none;">
      </div>
      <label for="artist-name">歌手名:</label>
      <input id = "artist-name" type="text" v-model="newArtist.name" placeholder="请输入歌手名" class="input-field">
      <label for="description">简介:</label>
      <textarea
          id="description"
          v-model="newArtist.bio"
          rows="6"
          cols="50"
          placeholder="请输入简介..."
          class="description-textarea">
      </textarea>
      <button class="upload-btn" @click="upload" >上传</button>
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
.add-artist {
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



/* 头像容器居中 */
.cover-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 10px; /* 居中 */
  text-align: center;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #B0B0B0; /* 浅灰色边框 */
  cursor: pointer;
  transition: transform 0.3s, border-color 0.3s ease-in-out;
}

/* 悬浮效果 */
.avatar-preview:hover {
  transform: scale(1.05); /* 放大 */
  border-color: #888888; /* 中灰色边框 */
}

/* 点击效果 */
.avatar-preview:active {
  transform: scale(0.95); /* 缩小 */
  border-color: #555555; /* 深灰色边框 */
}

/* "点击上传" 文字居中 */
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
  border-radius: 50%;
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


/* 为 label 添加间距 */
label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

/* 让整个表单内容居中 */
.add-artist {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left; /* 左对齐标签 */
}
</style>
