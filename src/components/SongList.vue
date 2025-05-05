<script setup>
import {computed, ref, watch} from "vue";
import {useMusicStore} from "@/stores/musicStore.js";
import {
  apiDeleteAudioFileBySongId,
  apiDeleteLrcFileBySongId,
  apiDeleteSongById,
  apiUpdateSong
} from "@/api/song-api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import AddMusic from "@/components/SongModal.vue";
import {apiGetCoverFileUrl} from "@/api/album-api.js";
import CommentSection from "@/components/CommentSection.vue";

const props = defineProps(['songs']);
const editingSong = ref(null);//用于存储被编辑歌曲的数据
const currentMusic = useMusicStore();
const authStore = useAuthStore();
const emit = defineEmits(["reloadSongs"]);
const songs = ref([])
const isSongModalVisible = ref(false)
const selectedSong = ref(null) // 当前要编辑的歌曲
const coverUrls = ref({});
// 选中的歌曲(用于显示评论)
const selectedSongForComments = ref(null);

const startEditSong = (song) => {
  editingSong.value = {...song};
}

const openAddSongModal = () => {
  selectedSong.value = null
  isSongModalVisible.value = true
}

const updateSong = async () => {
  await apiUpdateSong(editingSong.value);
  editingSong.value = null;
  emit("reloadSongs");
}

const deleteSong = async (song) => {
  await apiDeleteAudioFileBySongId(song.id);
  await apiDeleteLrcFileBySongId(song.id);
  await apiDeleteSongById(song.id);
  emit("reloadSongs");
}

const urlMap = ref({})

const togglePlayPause = (currentSong) => {
  if(currentMusic.currentSong.id === currentSong.id) {
    if(currentMusic.isPlaying) {
      currentMusic.pause();
    }
    else {
      currentMusic.play();
    }
  }
  else {
    currentMusic.setCurrentPlayList(props.songs);
    currentMusic.setCurrentAlbumUrlList(coverUrls.value);
    const index =props.songs.findIndex(song => song.id === currentSong.id)
    currentMusic.setCurrentSong(index);
  }
};

watch(isSongModalVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    emit("reloadSongs");
  }
})

const goToArtist = (artistId) => {
  router.push(`/artist/${artistId}`);
}

const goToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
}

const goToSong = (songId) => {
  router.push(`/song/${songId}`)
}

watch(
    () => props.songs,
    async (newSongs) => {
      if (!newSongs || newSongs.length === 0) return;
      for (const [index, song] of newSongs.entries()) {
        urlMap.value[index] = await apiGetCoverFileUrl(song.album.coverUrl);
      }
      coverUrls.value = urlMap.value;
    },
{ immediate: true } // 初始就触发一次
);

const searchQuery = ref("");
const items = computed(() => props.songs);

const filteredItems = computed(() =>
    items.value.filter(item =>
        String(item.title).toLowerCase().includes(searchQuery.value.toLowerCase())||
        String(item.artist.name).toLowerCase().includes(searchQuery.value.toLowerCase())||
        String(item.album.title).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

// 选中一首歌曲，显示或隐藏其评论
const toggleSongComments = (song) => {
  if (selectedSongForComments.value && selectedSongForComments.value.id === song.id) {
    // 如果点击的是当前已选中的歌曲，则取消选中
    selectedSongForComments.value = null;
  } else {
    // 否则选中该歌曲
    selectedSongForComments.value = song;
  }
};

</script>

<template>
  <v-container class="song-list">
    <!-- 顶部标题与上传按钮 -->
    <v-row>
      <v-col cols="12">
        <h2>歌曲列表</h2>
        <v-btn
            v-if="authStore.user.role === 'admin'"
            color="primary"
            class="mb-4"
            @click="openAddSongModal"
        >
          上传歌曲
        </v-btn>
      </v-col>
    </v-row>

    <v-text-field
        v-model="searchQuery"
        label="搜索"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
    />
    <!-- 歌曲列表 -->
    <div v-for="(song, index) in filteredItems" :key="index" class="mb-3">
      <v-card 
        class="compact-card" 
        :class="{ 'selected-song': selectedSongForComments && selectedSongForComments.id === song.id }"
      >
        <v-row no-gutters align="center">
          <!-- 封面图 -->
          <v-col cols="auto">
            <v-img
                :src="coverUrls[index]"
                alt="歌曲封面"
                width="80"
                height="80"
                class="rounded-lg elevation-1 border"
                cover
            ></v-img>
          </v-col>

          <!-- 歌名 -->
          <v-col cols="3" style="min-width: 0;">
            <v-card-title class="ellipsis">
              <v-label
                  @click="goToSong(song.id)"
                  class="ellipsis"
                  style="color: black; font-weight: bold;"
              >
                {{ song.title }}
              </v-label>
            </v-card-title>
          </v-col>

          <!-- 歌手和专辑 -->
          <v-col cols="5" style="min-width: 0;">
            <v-card-subtitle style="width: 100%;">
              <v-btn
                  variant="text"
                  size="small"
                  @click="goToArtist(song.artist.id)"
                  class="ellipsis"
                  style="max-width: 100%; text-transform: none;"
              >
                {{ song.artist.name }}
              </v-btn>
              <br />
              <v-btn
                  variant="text"
                  size="small"
                  @click="goToAlbum(song.album.id)"
                  class="ellipsis"
                  style="max-width: 100%; text-transform: none;"
              >
                {{ song.album.title }} | {{ song.duration }}
              </v-btn>
            </v-card-subtitle>
          </v-col>

          <!-- 操作按钮 -->
          <v-col cols="3" class="d-flex align-center justify-end" style="gap: 4px;">
            <v-btn icon variant="text" @click="togglePlayPause(song)" >
              <span v-if="currentMusic.currentSong.id===song.id && currentMusic.isPlaying" class="material-symbols-outlined">pause_circle</span>
              <span v-if="currentMusic.currentSong.id!==song.id||!currentMusic.isPlaying" class="material-symbols-outlined">play_arrow</span>
            </v-btn>

            <!-- 添加评论按钮 -->
            <v-btn icon variant="text" @click="toggleSongComments(song)">
              <span class="material-symbols-outlined">comment</span>
            </v-btn>

            <v-btn icon variant="text" v-if="authStore.user.role === 'admin'" @click="startEditSong(song)" class="me-1">
              <span class="material-symbols-outlined">edit_square</span>
            </v-btn>

            <!-- 删除歌曲按钮 -->
            <v-btn icon variant="text" v-if="authStore.user.role === 'admin'" @click="deleteSong(song)" class="me-1">
              <span class="material-symbols-outlined">delete</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- 评论区域，只在选中歌曲时显示 -->
      <div v-if="selectedSongForComments && selectedSongForComments.id === song.id" class="comment-container">
        <CommentSection content-type="song" :content-id="song.id" />
      </div>
    </div>

    <v-dialog v-if="editingSong" v-model="editingSong" max-width="600px">
      <!-- 编辑表单内容 -->
      <v-card>
        <v-card-title class="text-h5">
          编辑歌曲
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="editingSong.title" label="歌曲名"></v-text-field>
          <!-- 其他编辑字段 -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="updateSong">保存</v-btn>
          <v-btn color="error" @click="editingSong = null">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AddMusic 
      v-model:visible="isSongModalVisible" 
      :song="selectedSong"
      @close="isSongModalVisible = false; emit('reloadSongs')"
    />
  </v-container>
</template>

<style scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.compact-card {
  padding: 4px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.compact-card:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.selected-song {
  background-color: rgba(0, 0, 0, 0.04);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.comment-container {
  border-radius: 0 0 8px 8px;
  margin-top: -16px;
  margin-bottom: 16px;
  overflow: hidden;
}
</style>


