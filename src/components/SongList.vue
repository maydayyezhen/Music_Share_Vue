<script setup>
import {ref, watch} from "vue";
import {useMusicStore} from "@/stores/musicStore.js";
import {
  apiDeleteAudioFileBySongId, apiDeleteLrcFileBySongId,
  apiDeleteSongById,
  apiGetCoverFileUrlBySongId,
  apiUpdateSong
} from "@/api/song-api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import AddMusic from "@/components/SongModal.vue";

const props = defineProps(['songs']);
const songModalVisible = ref(false);//判断是否显示添加歌曲界面
const editingSong = ref(null);//用于存储被编辑歌曲的数据
const currentMusic = useMusicStore();
const authStore = useAuthStore();
const emit = defineEmits(["reloadSongs"]);

const startEditSong = (song) => {
  editingSong.value = {...song};
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

const playSong = (song) => {
  currentMusic.setCurrentSong(song);
};

watch(songModalVisible, (newVal, oldVal) => {
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


</script>

<template>
  <v-container class="song-list">
    <v-row>
      <v-col cols="12">
        <h2>歌曲列表</h2>
        <v-btn
            v-if="authStore.user.role === 'admin'"
            color="primary"
            class="mb-4"
            @click="songModalVisible = true"
        >
          上传歌曲
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-for="song in props.songs" :key="song.id">
      <v-col>
        <v-card>
          <v-row>
            <v-col class="d-flex align-center justify-end ml-1" style="max-width: 100px;">
              <v-img
                  :src="apiGetCoverFileUrlBySongId(song.id)"
                  alt="歌曲封面"
                  aspect-ratio="1"
                  width="100"
                  class="rounded-lg elevation-1 border d-flex align-center justify-center"
                  cover
              ></v-img>
            </v-col>

            <v-col cols="2" class="d-flex align-center justify-start">
              <v-card-title>{{ song.title }}</v-card-title>
            </v-col>

            <v-col class="d-flex align-center justify-start">
              <v-card-subtitle>
                <v-btn
                    variant="text"
                    size="small"
                    @click="goToArtist(song.artist.id)"
                >
                  {{ song.artist.name }}
                </v-btn>
                <br/>

                <v-btn
                    variant="text"
                    size="small"
                    @click="goToAlbum(song.album.id)"
                >
                  {{ song.album.title }} | {{ song.duration }}
                </v-btn>
              </v-card-subtitle>
            </v-col>

            <v-col class="d-flex align-center justify-end mr-1">
              <v-btn @click="playSong(song)" class="me-2">播放</v-btn>
              <v-btn
                  v-if="authStore.user.role === 'admin'"
                  @click="startEditSong(song)"
                  class="me-2"
              >
                更新
              </v-btn>
              <v-btn
                  v-if="authStore.user.role === 'admin'"
                  @click="deleteSong(song)"
              >
                删除
              </v-btn>
            </v-col>
          </v-row>

          <!-- 编辑区 -->
          <v-row v-if="editingSong && editingSong.id === song.id" class="pa-4">
            <v-col>
              <v-text-field v-model="editingSong.title" label="歌曲名称" dense></v-text-field>
            </v-col>
            <v-col>
              <v-text-field v-model="editingSong.duration" label="时长" dense></v-text-field>
            </v-col>
            <v-col>
              <v-btn @click="updateSong()" color="primary" block>保存</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 添加歌曲弹窗 -->
    <AddMusic v-if="songModalVisible" v-model:visible="songModalVisible" />
  </v-container>
</template>


<style scoped>
</style>