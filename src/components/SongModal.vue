<script setup>
import {onMounted, ref} from "vue";
import ArtistModal from "@/components/ArtistModal.vue";
import AlbumModal from "@/components/AlbumModal.vue";
import {apiGetAlbumByArtistId, apiGetAllAlbums, apiGetCoverFileUrlById} from "@/api/album-api.js";
import {apiGetAllArtists, apiGetArtistAvatarFileUrl} from "@/api/artist-api.js";
import {apiCreateSong, apiUploadAudioFile} from "@/api/song-api.js";
import {Artist} from "@/models/artist.js";
import {Album} from "@/models/album.js";
import {Song} from "@/models/song.js";

const artists = ref([{...Artist}]);
const albums = ref([{...Album}]);
const selectedArtist = ref({...Artist});
const selectedAlbum = ref({...Album});
const newSong = ref({...Song});


const getAllArtists = async () => {
  const response = await apiGetAllArtists();
  artists.value = response.data;
}

const getAllAlbums = async () => {
  const response = await apiGetAllAlbums();
  albums.value = response.data;
}

const getAlbumsByArtistId = async (artistId) => {
  const response = await apiGetAlbumByArtistId(artistId)
  albums.value = response.data;
}

const onArtistChange = async () => {
  selectedAlbum.value = null;
  await getAlbumsByArtistId(selectedArtist.value.id);
  selectedAlbum.value = albums.value[0];
}

const handelAlbumCreated = async (newAlbum) => {
  await getAllArtists();
  selectedArtist.value = artists.value.find(artist => artist.id === newAlbum.artist.id);
  await getAlbumsByArtistId(selectedArtist.value.id);
  selectedAlbum.value = albums.value.find(album => album.id === newAlbum.id);
}

const handelArtistCreated = async (newArtist) => {
  await getAllArtists();
  selectedArtist.value = artists.value.find(artist => artist.id === newArtist.id);
  await getAlbumsByArtistId(selectedArtist.value.id);
}

const selectedAudioFile = ref(null);
const formattedDuration = ref(null);
const duration = ref();
const audio = new Audio();

const selectAudioFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedAudioFile.value = file;
    console.log("📂 选中文件:", file.name);
  } else {
    console.warn("⚠ 没有选中文件");
  }
  audio.src = URL.createObjectURL(file);
  audio.onloadedmetadata = () => {
    duration.value = audio.duration;
    const minutes = Math.floor(duration.value / 60);
    const seconds = Math.floor(duration.value % 60);
    formattedDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
};

const emit = defineEmits(["close"]);

const upload = async () => {
  const response = await apiUploadAudioFile(selectedAudioFile.value);
  newSong.value.audioFilename = response.data;
  newSong.value.artist.id = selectedArtist.value.id;
  newSong.value.album.id = selectedAlbum.value.id;
  newSong.value.duration = duration.value;

  await apiCreateSong(newSong.value);
  alert("上传成功");
  emit('close');
}


const modalType = ref('');
const isCreating = ref(false);
const openModal = (type) => {
  modalType.value = type;
  isCreating.value = true;
};
onMounted(getAllArtists);
onMounted(getAllAlbums);
</script>

<template>
  <div id="music-modal" class="modal">
    <div class="add-music">
      <button class="cancel-btn" @click="$emit('close')">×</button>
      <h2>添加音乐</h2>
      <input type="text" v-model="newSong.title" placeholder="输入歌曲名">

      <label for="artist">选择歌手</label>


      <div class="select-container">
        <div v-if="selectedArtist.id" class="image-container">
          <img :src="apiGetArtistAvatarFileUrl(selectedArtist.id)" alt="歌手头像" />
        </div>
        <select id="artist" v-model="selectedArtist" @change="onArtistChange">
          <option value="" disabled selected>请选择或输入歌手</option>
          <option v-for="artist in artists" :key="artist.id" :value="artist">
            {{ artist.name }}
          </option>
        </select>
        <button @click="openModal('artist')">+</button>
        <artist-modal v-if="modalType === 'artist' && isCreating" @close="isCreating=false" @artist-created="handelArtistCreated" />
      </div>

      <label for="album">选择专辑</label>

      <div class="select-container">
        <div v-if="selectedAlbum.id" class="image-container">
          <img :src="apiGetCoverFileUrlById(selectedAlbum.id)" alt="专辑封面" />
        </div>
        <select id="album" v-model="selectedAlbum">
          <option value="" disabled selected>请选择或输入专辑</option>
          <option v-for="album in albums" :key="album.id" :value="album">
            {{ album.title }}
          </option>
        </select>
        <button @click="openModal('album')">+</button>
        <album-modal v-if="modalType === 'album' && isCreating" @close ="isCreating = false" @album-created="handelAlbumCreated"/>
      </div>
      <input type="text" v-model="formattedDuration" placeholder="时长（mm:ss）" readonly />
      <input id="audio-file-input" type="file" @change="selectAudioFile" accept="audio/*">
      <textarea v-model="newSong.lyrics" placeholder="请输入歌词" required></textarea>
      <!-- 上传按钮 -->
      <button class="upload-btn" @click="upload">上传</button>
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
  background: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-container {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 控制图片和 select 之间的间距 */
}

.image-container {
  width: 40px; /* 头像大小 */
  height: 40px;
  flex-shrink: 0; /* 防止图片缩小 */
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片完整填充 */
  border-radius: 50%; /* 让图片变成圆形 */
  border: 2px solid #ccc; /* 可选，给头像加一个边框 */
}

select {
  flex-grow: 1; /* 让 select 占据剩余空间 */
  padding: 5px;
  font-size: 16px;
}

button {
  margin-left: 5px; /* 让按钮和 select 之间有间距 */
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
}


/* 弹窗主体 */
.add-music {
  background: white;
  width: 350px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  text-align: center;
}

/* 输入框 */
.add-music input {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.add-music input:focus {
  border-color: #007BFF;
}

/* 上传按钮 */
.upload-btn {
  width: 100%;
  background: #007BFF;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.upload-btn:hover {
  background: #0056b3;
}

</style>