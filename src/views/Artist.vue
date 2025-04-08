<script setup>
import {onMounted, ref} from 'vue'
import{Artist} from "@/models/artist.js";
import {apiGetArtistAvatarFileUrl, apiGetArtistById} from "@/api/artist-api.js";
import {useRoute} from "vue-router";
import {Album} from "@/models/album.js";
import {apiGetAlbumsByArtistId, apiGetCoverFileUrlById} from "@/api/album-api.js";
import {Song} from "@/models/song.js";
import {apiGetSongsByArtistId} from "@/api/song-api.js";
import SongList from "@/components/SongList.vue";
import router from "@/router/index.js";
const route = useRoute();
const artist = ref({...Artist})
const albums = ref([{...Album}]);
const songs = ref([{...Song}]);

const getSongsByArtistId = async (artistId) => {
  const response = await apiGetSongsByArtistId(artistId);
  songs.value = response.data;
}

const goToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
}

onMounted(async () => {
  const artistResponse = await apiGetArtistById(route.params.id);
  artist.value = artistResponse.data;
  const albumsResponse = await apiGetAlbumsByArtistId(route.params.id);
  albums.value = albumsResponse.data;
  await getSongsByArtistId(route.params.id);
})

</script>

<template>
  <div class="container">
      <!-- 歌手信息卡片 -->
        <v-row align="center" justify-center>
          <v-col cols="12" md="4" class="text-center">
            <v-img
                :src="apiGetArtistAvatarFileUrl(artist.id)"
                alt="Artist Image"
                width="150"
                height="150"
                cover
                rounded="circle"
                class="mx-auto"
            ></v-img>
          </v-col>
          <v-col cols="12" md="8">
            <h2 class="text-h4 font-weight-medium mb-2">{{ artist.name }}</h2>
            <p class="text-subtitle-1 text-grey-darken-1">{{ artist.bio }}</p>
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>

      <!-- 专辑列表卡片 -->
        <h3 class="text-h5 font-weight-medium mb-4">🎵 专辑列表</h3>
    <v-row dense class="album-grid">
      <v-col
          v-for="album in albums"
          :key="album.id"
          cols="12"
          sm="4"
          md="3"
          lg="2"
          class="d-flex justify-center"
      >
        <v-card
            @click="goToAlbum(album.id)"
            class="pa-2 hoverable text-center"
            elevation="2"
            rounded="lg"
            max-width="160"
        >
          <v-img
              :src="apiGetCoverFileUrlById(album.id)"
              alt="专辑封面"
              height="120px"
              width="120px"
              cover
              class="mb-2 mx-auto rounded"
          ></v-img>

          <v-card-title class="text-subtitle-2 font-weight-medium">
            {{ album.title }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-divider class="my-8"></v-divider>
      <h3 class="text-h5 font-weight-medium mb-4">🎶 歌曲列表</h3>
      <SongList
          :songs="songs"
          @reload-songs="getSongsByArtistId(route.params.id)"
      />
  </div>
</template>




<style scoped>
.container {
  width: 80vw;
  display: flex;
  flex-direction: column;
}
</style>