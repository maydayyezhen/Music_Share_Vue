<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {useAuthStore} from "@/stores/authStore.js";

import { Album } from "@/models/album.js"
import { Song } from "@/models/song.js"

import {apiDeleteAlbumById, apiDeleteCoverFileById, apiGetAlbumByAlbumId, apiGetCoverFileUrl} from "@/api/album-api.js"
import { apiGetSongsByAlbumId } from "@/api/song-api.js"

import SongList from "@/components/SongList.vue"
import AlbumModal from "@/components/AlbumModal.vue"
import { useRouter } from 'vue-router'


const router = useRouter()
const route = useRoute()
const album = ref({ ...Album })
const songs = ref([{ ...Song }])
const activeTab = ref('playlist') // 当前选中的 tab
const editDialogVisible = ref(false)
const authStore = useAuthStore();
const emit = defineEmits(["deleteAlbum"]);

const getSongsByAlbumId = async (albumId) => {
  const songsResponse = await apiGetSongsByAlbumId(albumId);
  songs.value = songsResponse.data;
}

const deleteAlbum = async (album) =>{
  const confirmed = window.confirm(`确定要删除专辑《${album.title}》吗？此操作会一并删除专辑内的所有歌曲，且无法撤销。`);
  if (!confirmed) return;

  try {
    if (album.coverUrl){
      await apiDeleteCoverFileById(album.id);
    }
    await apiDeleteAlbumById(album.id);
    alert("删除成功");
    emit("deleteAlbum");
    await router.push('/music_db')
  } catch (error) {
    console.error("删除失败", error);
    alert("删除失败，请稍后再试");
  }
}

function changeTab(tab) {
  activeTab.value = tab
}

//刷新模块开始
const songListKey = ref(Date.now())
const coverImageKey = ref(Date.now())
const getAlbumById = async (id) => {
  const albumsResponse = await apiGetAlbumByAlbumId(id);
  album.value = albumsResponse.data;
}
const refreshSongList = () => {
  songListKey.value = Date.now()
}
const refreshCoverImage = () => {
  coverImageKey.value = Date.now()
}
const refreshAll = async () => {
  await getAlbumById(route.params.id);
  await getSongsByAlbumId(route.params.id);
  refreshCoverImage();
  refreshSongList();
}
onMounted(async () => {
  await refreshAll();
})
//刷新模块结束
</script>


<template>
  <v-container fluid class="pa-0" max-width="lg">
    <!-- 专辑头部信息 -->
    <v-row align="center" class="mb-6" justify="center">
      <v-col cols="12" md="4" class="text-center">
        <v-img
            :key="coverImageKey"
            :src="apiGetCoverFileUrl(album.coverUrl)"
            alt="专辑封面"
            class="mx-auto rounded-lg elevation-4"
            height="200"
            width="200"
            cover
        ></v-img>
      </v-col>

      <v-col cols="12" md="8" class="d-flex flex-column justify-center">
        <h1 class="text-h4 font-weight-medium mb-2">{{ album.title }}</h1>
        <p class="text-subtitle-1 text-grey-darken-1">发行日期：{{ album.releaseDate }}</p>
        <v-row>

          <v-btn
              class="mt-5"
              size="small"
              color="primary"
              @click="editDialogVisible = true"
              style="width: 100px;"
          >
            编辑信息
          </v-btn>
          <v-btn
              class="mt-5 ml-4"
              size="small"
              color="primary"
              v-if="authStore.user.role === 'admin'"
              @click="deleteAlbum(album)"
              style="width: 100px;"
          >
            删除专辑
          </v-btn>

        </v-row>
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <!-- 中间导航栏 -->
    <v-row justify="center" class="mb-6">
      <v-btn
          v-for="tab in ['playlist', 'description']"
          :key="tab"
          :class="['mx-2', { 'v-btn--active': activeTab === tab }]"
          @click="changeTab(tab)"
          variant="outlined"
          rounded="lg"
          :color="activeTab === tab ? 'primary' : 'grey'"
      >
        {{ tab === 'playlist' ? '播放列表' : '简介' }}
      </v-btn>
    </v-row>

    <!-- 内容展示区 -->
    <v-row justify="center" class="album-content">
      <v-col v-if="activeTab === 'playlist'" cols="12">
        <SongList :key="songListKey" :songs="songs" @reload-songs="getSongsByAlbumId(route.params.id)" />
      </v-col>

      <v-col v-else-if="activeTab === 'description'" cols="12" md="10">
        <v-card class="pa-4" elevation="1" rounded="lg">
          <p class="text-body-1 text-grey-darken-2 leading-relaxed">
            {{ album.description }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <album-modal
        v-model="editDialogVisible"
        :album-data="album"
        mode="edit"
        @album-updated="refreshAll"
    />
  </v-container>
</template>

<style scoped>
.leading-relaxed {
  line-height: 1.8;
}
</style>
