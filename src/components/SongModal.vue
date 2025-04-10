<script setup>
import {onMounted, ref} from "vue";
import ArtistModal from "@/components/ArtistModal.vue";
import AlbumModal from "@/components/AlbumModal.vue";
import {apiGetAlbumsByArtistId, apiGetAllAlbums, apiGetCoverFileUrl} from "@/api/album-api.js";
import {apiGetAllArtists, apiGetArtistAvatarFileUrl} from "@/api/artist-api.js";
import {apiCreateSong, apiUploadAudioFile, apiUploadLrcFile} from "@/api/song-api.js";
import {Artist} from "@/models/artist.js";
import {Album} from "@/models/album.js";
import {Song} from "@/models/song.js";

const artists = ref([{...Artist}]);
const albums = ref([{...Album}]);
const selectedArtist = ref(null);
const selectedAlbum = ref(null);
const newSong = ref({...Song});
const artistSelect = ref(null);


const getAllArtists = async () => {
  const response = await apiGetAllArtists();
  artists.value = response.data;
}

const getAllAlbums = async () => {
  const response = await apiGetAllAlbums();
  albums.value = response.data;
}

const getAlbumsByArtistId = async (artistId) => {
  const response = await apiGetAlbumsByArtistId(artistId)
  albums.value = response.data;
}

const onArtistChange = async () => {
  selectedAlbum.value = null;
  await getAlbumsByArtistId(selectedArtist.value.id);
  selectedAlbum.value = albums.value[0];
  artistSelect.value.menu = false;
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
  selectedAlbum.value = null;
}

const selectedAudioFile = ref(null);
const selectedLrcFile = ref(null);
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

const selectLrcFile = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedLrcFile.value = file;
    console.log("📂 选中文件:", file.name);
  } else {
    console.warn("⚠ 没有选中文件");
  }
}

const upload = async () => {
  newSong.value.artist.id = selectedArtist.value.id;
  newSong.value.album.id = selectedAlbum.value.id;
  newSong.value.duration = duration.value;
  const response = await apiCreateSong(newSong.value);
  await apiUploadLrcFile(response.data.id,selectedLrcFile.value);
  await apiUploadAudioFile(response.data.id,selectedAudioFile.value);
  alert("上传成功");
  visible.value = false;
}


const artistModalVisible = ref(false);
const albumModalVisible = ref(false);

onMounted(getAllArtists);
onMounted(getAllAlbums);

const visible = defineModel('visible')

</script>

<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="auto">
            <span class="headline">添加音乐</span>
          </v-col>
          <v-col cols="auto" class="ml-auto">
            <v-btn variant="text" class="mr-0" icon @click="visible = false">
              <span class="material-symbols-outlined">close</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-row align="center" justify="center" style="gap: 16px;">
          <v-col cols="auto">
            <v-text-field
                variant="outlined"
                color="primary"
                rounded="lg"
                elevation="1"
                v-model="newSong.title"
                label="歌曲名"
                placeholder="输入歌曲名"
                outlined
                style="width: 200px"
            />
          </v-col>
        </v-row>

        <v-row
            align="center"
            justify="center"
            style="gap: 16px;"
        >
          <v-col cols="auto">
            <v-autocomplete
                variant="outlined"
                color="primary"
                rounded="xl"
                ref="artistSelect"
                v-model="selectedArtist"
                :items="artists"
                item-title="name"
                label="选择歌手"
                @update:modelValue="onArtistChange"
                return-object
                style="width: 300px"
            >

              <template v-slot:prepend-item>
                <v-btn
                    @click="artistModalVisible = true"
                    color="primary"
                    size="small"
                    block
                    class="justify-center"
                >
                  + 添加歌手
                </v-btn>
              </template>


              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" >
                  <template v-slot:prepend>
                    <v-avatar size="30" class="mr-2">
                      <v-img :src="apiGetArtistAvatarFileUrl(item.raw.avatarUrl)" />
                    </v-avatar>
                  </template>
                  <template v-slot:title>
                    {{ item.raw.name }}
                  </template>
                </v-list-item>
              </template>

              <template v-slot:selection="{ item }">
                <v-avatar size="30" class="mr-2">
                  <v-img :src="apiGetCoverFileUrl(item.raw.avatarUrl)" />
                </v-avatar>
                {{ item.raw.name }}
              </template>

            </v-autocomplete>
          </v-col>
        </v-row>


        <v-row align="center" justify="center" style="gap: 16px;">
          <v-col cols="auto">
            <v-autocomplete
                variant="outlined"
                color="primary"
                rounded="xl"
                v-model="selectedAlbum"
                :items="albums"
                item-title="title"
                return-object
                label="选择专辑"
                style="width: 300px"
            >

              <template v-slot:prepend-item>
                <v-btn
                    @click="albumModalVisible = true"
                    color="primary"
                    size="small"
                    block
                    class="justify-center"
                >
                  + 添加专辑
                </v-btn>
              </template>

              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" >
                  <template v-slot:prepend>
                    <v-avatar size="30" class="mr-2" :rounded="0">
                      <v-img :src="apiGetCoverFileUrl(item.raw.coverUrl)" />
                    </v-avatar>
                  </template>
                  <template v-slot:title>
                    {{ item.raw.title }}
                  </template>
                </v-list-item>
              </template>

              <template v-slot:selection="{ item }">
                  <v-avatar size="30" class="mr-2" :rounded="0">
                    <v-img :src="apiGetCoverFileUrl(item.raw.coverUrl)" />
                  </v-avatar>
                {{ item.raw.title }}
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>



        <v-text-field
            variant="outlined"
            color="primary"
            rounded="lg"
            elevation="1"
            v-model="formattedDuration"
            label="时长（mm:ss）"
            placeholder="时长（mm:ss）"
            readonly
            outlined
        />

        <v-file-input
            variant="outlined"
            color="primary"
            rounded="lg"
            elevation="1"
            id="audio-file-input"
            label="选择音频文件"
            accept="audio/*"
            @change="selectAudioFile"
            outlined
        />

        <v-file-input
            variant="outlined"
            color="primary"
            rounded="lg"
            elevation="1"
            id="lyrics-file-input"
            label="选择歌词文件"
            accept=".lrc,.txt"
            @change="selectLrcFile"
            outlined
        />


        <v-textarea
            variant="outlined"
            color="primary"
            rounded="lg"
            elevation="1"
            v-model="newSong.lyrics"
            label="歌词"
            placeholder="请输入歌词"
            outlined
        />

      </v-card-text>

      <v-card-actions>
        <v-btn class="upload-btn" color="primary" @click="upload">
          上传
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <artist-modal
      v-if="artistModalVisible"
      v-model:visible="artistModalVisible"
      @artist-created="handelArtistCreated"
  />
  <album-modal
      v-if="albumModalVisible"
      v-model:visible="albumModalVisible"
      @album-created="handelAlbumCreated"
  />
</template>

<style scoped>
</style>