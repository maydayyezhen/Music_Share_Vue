<script setup>
import Layout from "@/components/Layout.vue";
import AddSong from "@/components/AddSong.vue";
import {onMounted, ref} from "vue";
import axios from "axios";
const songs = ref([]);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const addOrNot = ref(false);//判断是否显示添加歌曲界面
const editingSong = ref(null);//用于存储被编辑歌曲的数据
const currentSong = ref(null);//用于存储当前播放的歌曲
const audioPlayer = ref(null);

const getAllSongs = async () => {
  const url = `${API_BASE_URL}/songs`;
  console.log(`🚀 正在请 求: ${url}`);
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

const deleteSong = async (song) => {
  const url = `${API_BASE_URL}/songs/${song.id}`;
  console.log(`🚀 正在请求: ${url}`);
  await axios.delete(`${API_BASE_URL}/file`, {
    params: { path: song.coverUrl }
  });
  const response1 = await axios.delete(`${API_BASE_URL}/file`, {
    params: { path: song.fileUrl }
  });
  console.log(response1);
  const response2 =  await axios.delete(`${API_BASE_URL}/songs/${song.id}`);
  console.log(response2);
  await getAllSongs();
}

const playSong = (song) => {
  currentSong.value = { ...song };
  console.log("播放歌曲:", song.title);
  audioPlayer.value.src = `${API_BASE_URL}/file?path=${song.fileUrl}`;
};

const isPlaying = ref(false);
const progress = ref(0);
const currentTime = ref(0); // 当前播放时间（秒）
const duration = ref(0); // 音频总时长（秒）
const isDragging = ref(false);
const wasPlayingBeforeDrag = ref(false);
const progressBar = ref(null);

// 播放/暂停切换
const togglePlay = () => {
  if (!audioPlayer.value) return;
  if (audioPlayer.value.paused) {
    audioPlayer.value.play();
    isPlaying.value = true;
  } else {
    audioPlayer.value.pause();
    isPlaying.value = false;
  }
};

// 更新进度条和时间
const updateProgress = () => {
  if (!isDragging.value && audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime;
    duration.value = audioPlayer.value.duration || 0;
    progress.value = (currentTime.value / duration.value) * 100;
  }
};

// 点击进度条跳转
const seek = (event) => {
  if (!audioPlayer.value || isDragging.value) return;
  const barWidth = event.currentTarget.offsetWidth;
  const clickX = event.offsetX;
  audioPlayer.value.currentTime = (clickX / barWidth) * audioPlayer.value.duration;
};

// 开始拖拽
const startDrag = (event) => {
  if (!audioPlayer.value) return;
  isDragging.value = true;
  wasPlayingBeforeDrag.value = !audioPlayer.value.paused;

  if (wasPlayingBeforeDrag.value) {
    audioPlayer.value.pause();
    isPlaying.value = false;
  }

  // 拖拽过程处理
  const moveHandler = (moveEvent) => {
    const barRect = progressBar.value.getBoundingClientRect();
    let newProgress = ((moveEvent.clientX - barRect.left) / barRect.width) * 100;
    newProgress = Math.max(0, Math.min(100, newProgress));
    progress.value = newProgress;
    currentTime.value = (newProgress / 100) * duration.value;
  };

  // 停止拖拽
  const stopDrag = () => {
    isDragging.value = false;
    audioPlayer.value.currentTime = currentTime.value;

    if (wasPlayingBeforeDrag.value) {
      audioPlayer.value.play();
      isPlaying.value = true;
    }

    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', stopDrag);
  };

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', stopDrag);
};

// 音频播放结束处理
const onSongEnd = () => {
  isPlaying.value = false;
  progress.value = 0;
  currentTime.value = 0;
};

// 时间格式化 (秒 -> mm:ss)
const formatTime = (time) => {
  if (isNaN(time) || time < 0) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
          <img :src="`${API_BASE_URL}/file?path=${song.coverUrl}`" alt="歌曲封面" />
        </div>
        {{song.title}} {{song.artist}} {{song.duration}}
        <button @click="playSong(song)">播放</button>
        <button @click="deleteSong(song)">删除</button>
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
  <AddSong v-if="addOrNot" @close="getAllSongs(); addOrNot = false"/>

  <div v-show="currentSong" class="fixed-bottom player-container">
    <div class="player-content">
      <!-- 圆形专辑封面 -->
      <div class="album-art-container">
        <img
            :src="`${API_BASE_URL}/file?path=${currentSong?.coverUrl}`"
            alt="Album Art"
            class="album-art"
            :class="{ playing: isPlaying }"
        />
      </div>

      <!-- 歌曲信息 -->
      <div class="song-info">
        <h2 class="player-title">{{ currentSong?.title || '暂无歌曲' }}</h2>
        <h3 class="player-artist">{{ currentSong?.artist || '暂无歌手' }}</h3>
      </div>

      <!-- 播放/暂停按钮 -->
      <button class="play-button" @click="togglePlay">
        <!-- 暂停图标 -->
        <svg
            v-if="isPlaying"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <!-- 播放图标 -->
        <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
    </div>

    <!-- 进度条和时间 -->
    <div class="progress-container">
      <span class="time">{{ formatTime(currentTime) }}</span>

      <div class="progress-bar" @click="seek" ref="progressBar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
        <div
            class="progress-thumb"
            :style="{ left: `calc(${progress}% - 6px)` }"
            @mousedown.stop="startDrag"
        ></div>
      </div>

      <span class="time">{{ formatTime(duration) }}</span>
    </div>

    <!-- 隐藏的原生音频控件 -->
    <audio ref="audioPlayer" @timeupdate="updateProgress" @ended="onSongEnd"></audio>
  </div>

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
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明遮罩层 */
  z-index: 1000; /* 遮罩层在最上面 */
}
/* 播放器容器 */
.player-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  background: linear-gradient(135deg, #4a4a4a, #2b2b2b);
  border-radius: 50px;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* 播放器主要内容 */
.player-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 15px;
}

/* 专辑封面（圆形） */
.album-art-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0; /* 防止缩小 */
}

.album-art {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 歌曲信息 */
.song-info {
  flex: 1; /* 占据剩余空间 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.player-title {
  font-size: 16px;
  color: #fff;
  margin: 0;
}

.player-artist {
  font-size: 14px;
  color: #aaa;
  margin: 0;
}

/* 自定义播放按钮 */
.play-button {
  background: #e53935;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0; /* 防止缩小 */
}

.play-button:hover {
  background: #d32f2f;
}

.play-button svg {
  width: 28px;
  height: 28px;
}

/* 进度条容器 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
}

/* 进度条背景 */
.progress-bar {
  flex: 1; /* 占据最大空间 */
  height: 6px; /* 提升高度，确保可见 */
  border-radius: 5px;
  background: #444;
  cursor: pointer;
  position: relative; /* 作为子元素定位的参考 */
  overflow: hidden;
  z-index: 1; /* 确保在上方 */
}

/* 进度条前景 */
.progress {
  height: 100%;
  width: 0; /* 初始宽度为 0 */
  background: #e53935;
  border-radius: 5px;
  transition: width 0.1s ease; /* 平滑动画 */
  z-index: 2; /* 确保显示在滑块之下 */
}

/* 拖拽滑块 */
.progress-thumb {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #e53935;
  border-radius: 50%;
  cursor: grab;
  z-index: 3; /* 确保在最前方 */
}

/* 时间样式 */
.time {
  font-size: 14px;
  color: #aaa;
  flex-shrink: 0; /* 防止缩小 */
}

/* 隐藏原生音频控件 */
audio {
  display: none;
}





</style>