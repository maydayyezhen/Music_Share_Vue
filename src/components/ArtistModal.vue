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
  const response = await apiCreateArtist(newArtist.value);
  await apiUploadAvatarFile(response.data.id,selectedImgFile.value);
  const createdArtist = response.data;
  emit('artist-created', createdArtist);
  alert("上传成功");
  visible.value = false;
}

const visible = defineModel('visible')

</script>

<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>新建歌手</span>
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
          <input id="avatar-file-input" type="file" ref="fileInput" @change="selectAvatar" accept="image/*" style="display: none;" />
        </div>

        <v-text-field
            v-model="newArtist.name"
            label="歌手名"
            outlined
            placeholder="请输入歌手名"
        />

        <v-textarea
            v-model="newArtist.bio"
            label="简介"
            outlined
            placeholder="请输入简介..."
            rows="6"
        />

        <v-btn @click="upload" color="primary" block class="mt-4">上传</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
