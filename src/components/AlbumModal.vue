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


const emit = defineEmits(["albumCreated"]);
const upload = async () => {
  newAlbum.value.artist.id = selectedArtist.value.id;
  const response = await apiCreateAlbum(newAlbum.value);
  await apiUploadCoverFile(response.data.id,selectedImgFile.value);
  emit("albumCreated", response.data);
  alert("上传成功");
  visible.value = false;
}

const handleArtistCreated = async (newArtist) => {
  await getAllArtists();
  selectedArtist.value = artists.value.find(artist => artist.id === newArtist.id);
}

const artistModalVisible = ref(false);
const visible = defineModel('visible')

</script>

<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>新建专辑</span>
        <v-btn icon @click="visible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="text-center mb-4">
          <v-img
              v-if="imgUrl"
              :src="imgUrl"
              class="mx-auto"
              width="200"
              height="200"
              cover
              @click="triggerFileInput"
          ></v-img>
          <v-btn v-else @click="triggerFileInput" color="primary">点击上传</v-btn>
          <input id="cover-file-input" type="file" ref="fileInput" @change="selectCover" accept="image/*" style="display: none;" />
        </div>

        <v-text-field v-model="newAlbum.title" label="专辑名" outlined />

        <v-select
            v-model="selectedArtist"
            :items="artists"
            item-title="name"
            return-object
            label="选择歌手"
            outlined
        >
          <template v-slot:append-item>
            <v-btn @click="artistModalVisible = true" color="primary" small block>+ 添加歌手</v-btn>
          </template>
        </v-select>

        <div v-if="selectedArtist?.id" class="my-4 text-center">
          <v-img
              :src="apiGetArtistAvatarFileUrl(selectedArtist.avatarUrl)"
              width="100"
              height="100"
              cover
              class="mx-auto rounded"
          ></v-img>
        </div>

        <v-textarea v-model="newAlbum.description" label="简介" outlined auto-grow />

        <v-text-field
            v-model="newAlbum.releaseDate"
            label="发行日期"
            type="date"
            outlined
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="upload">确认</v-btn>
      </v-card-actions>
    </v-card>

    <!-- 歌手新增弹窗 -->
    <artist-modal v-if="artistModalVisible" v-model:visible="artistModalVisible" @artist-created="handleArtistCreated"/>
  </v-dialog>
</template>


<style scoped>
</style>