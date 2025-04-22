<script setup>
import {onMounted, ref} from 'vue'
import{Artist} from "@/models/artist.js";
import {
  apiDeleteArtistById,
  apiDeleteAvatarFileById,
  apiGetArtistAvatarFileUrl,
  apiGetArtistById
} from "@/api/artist-api.js";
import {useRoute} from "vue-router";
import {Album} from "@/models/album.js";
import {
  apiGetAlbumsByArtistId,
  apiGetCoverFileUrl
} from "@/api/album-api.js";
import {Song} from "@/models/song.js";
import {apiGetSongsByArtistId} from "@/api/song-api.js";
import SongList from "@/components/SongList.vue";
import router from "@/router/index.js";
import ArtistModal from '@/components/ArtistModal.vue'
import {useAuthStore} from "@/stores/authStore.js";

const route = useRoute();
const artist = ref({...Artist})
const albums = ref([{...Album}]);
const songs = ref([{...Song}]);
const artistModalVisible = ref(false)
const selectedArtist = ref(null)
const editArtistMode = ref('create')
const authStore = useAuthStore();

const openEditArtistModal = (artist) => {
  selectedArtist.value = { ...artist }
  editArtistMode.value = 'edit'
  artistModalVisible.value = true
}

const getSongsByArtistId = async (artistId) => {
  const response = await apiGetSongsByArtistId(artistId);
  songs.value = response.data;
}

const getArtistById = async (artistId) => {
  const artistResponse = await apiGetArtistById(artistId);
  artist.value = artistResponse.data;
}

const getAlbumByArtistId = async (artistId) => {
  const albumsResponse = await apiGetAlbumsByArtistId(artistId);
  albums.value = albumsResponse.data;
}

const goToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
}

const deleteArtist = async (artist) => {
  const confirmed = window.confirm(`确定要删除歌手「${artist.name}」吗？此操作会删除歌手旗下的所有专辑和歌曲，且无法撤销。`);
  if (!confirmed) return;

  try {
    if (artist.avatarUrl) {
      await apiDeleteAvatarFileById(artist.id);
    }
    await apiDeleteArtistById(artist.id);
    alert("删除成功");
    await router.push('/music_db'); // 删除后返回首页或歌手列表页
  } catch (error) {
    console.error("删除失败", error);
    alert("删除失败，请稍后再试");
  }
};

const artistAvatarKey = ref(Date.now());

const refreshArtistAvatar = () => {
  artistAvatarKey.value = Date.now()
}

const refreshAll = async () =>{
  await getArtistById(route.params.id);
  await getAlbumByArtistId(route.params.id);
  await getSongsByArtistId(route.params.id);
  refreshArtistAvatar();
}

onMounted(async () => {
  await refreshAll();
})

</script>

<template>
  <v-container
      fluid
      class="pa-0"
      style="width: 100%; height: 100%; padding-left: 16px; padding-right: 16px;"
  >
    <!-- 歌手信息卡片 -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" md="4" class="text-center">
        <v-img
            :key="artistAvatarKey"
            :src="apiGetArtistAvatarFileUrl(artist.avatarUrl)"
            alt="Artist Image"
            width="150"
            height="150"
            cover
            rounded="circle"
            class="mx-auto"
        ></v-img>
      </v-col>

      <v-col cols="12" md="8">
        <h2 class="text-h4 font-weight-medium mb-2">
          {{ artist.name }}
        </h2>
        <p class="text-subtitle-1 text-grey-darken-1">
          {{ artist.bio }}
        </p>

        <v-row>
          <v-btn
              class="mt-5"
              size="small"
              color="primary"
              @click="openEditArtistModal(artist)"
              style="width: 100px;"
          >
            编辑信息
          </v-btn>

          <v-btn
              class="mt-5 ml-4"
              size="small"
              color="primary"
              v-if="authStore.user.role === 'admin'"
              @click="deleteArtist(artist)"
              style="width: 100px;"
          >
            删除歌手
          </v-btn>

        </v-row>

      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <!-- 专辑列表 -->
    <h3 class="text-h5 font-weight-medium mb-4">🎵 专辑列表</h3>
    <v-row dense class="album-grid">
      <v-col
          v-for="album in albums"
          :key="album.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
          class="d-flex justify-center"
      >
        <v-card
            @click="goToAlbum(album.id)"
            class="pa-2 hover able text-center"
            elevation="1"
            rounded="lg"
            max-width="160"
        >
          <v-img
              :src="apiGetCoverFileUrl(album.coverUrl)"
              alt="专辑封面"
              height="120"
              width="120"
              cover
              class="mb-2 mx-auto rounded"
          ></v-img>

          <v-card-title class="text-subtitle-2 font-weight-medium text-truncate">
            {{ album.title }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-8"></v-divider>

    <!-- 歌曲列表 -->
    <h3 class="text-h5 font-weight-medium mb-4">🎶 歌曲列表</h3>
    <SongList
        :songs="songs"
        @reload-songs="getSongsByArtistId(route.params.id)"
    />
  </v-container>
  <artist-modal
      v-if="artistModalVisible"
      v-model="artistModalVisible"
      :artist-data="selectedArtist"
      :mode="editArtistMode"
      @artist-updated="refreshAll"
  />
</template>

<style scoped>
.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
