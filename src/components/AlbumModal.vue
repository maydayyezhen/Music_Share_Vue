<script setup>
import {onMounted, ref, watch} from "vue";
import ArtistModal from "@/components/ArtistModal.vue";
import {
  apiGetAllArtists,
  apiGetArtistAvatarFileUrl
} from "@/api/artist-api.js";
import {
  apiCreateAlbum,
  apiUploadCoverFile,
  apiUpdateAlbum, apiDeleteCoverFileById
} from "@/api/album-api.js";
import {Album} from "@/models/album.js";
import {Artist} from "@/models/artist.js";
import CommentSection from "@/components/CommentSection.vue";

// Props: 专辑初始值和是否编辑
const props = defineProps({
  modelValue: Boolean,
  albumData: {
    type: Object,
    default: () => ({...Album})
  },
  mode: {
    type: String,
    default: 'create' // or 'edit'
  }
});

const emit = defineEmits(["update:modelValue", "albumCreated", "albumUpdated"]);

const visible = ref(props.modelValue);
watch(() => props.modelValue, val => (visible.value = val));
watch(visible, val => emit("update:modelValue", val));

const artists = ref([]);
const selectedArtist = ref({...Artist});
const currentAlbum = ref({...Album});
const selectedImgFile = ref(null);
const imgUrl = ref("");
const artistModalVisible = ref(false);

// 初始化
const getAllArtists = async () => {
  const response = await apiGetAllArtists();
  artists.value = response.data;
};



watch(
    () => props.albumData,
    async (newAlbum) => {
      if (props.mode === 'edit' && newAlbum) {
        currentAlbum.value = {...newAlbum}
        selectedArtist.value = newAlbum.artist
        imgUrl.value = await apiGetArtistAvatarFileUrl(newAlbum.coverUrl)
      } else {
        currentAlbum.value = {...Album}
        selectedArtist.value = {...Artist}
        imgUrl.value = ''
      }
    },
    { immediate: true }
)

watch(() => props.mode, (newMode) => {
  if (newMode === 'create') {
    currentAlbum.value = { ...Album }
    selectedArtist.value = { ...Artist }
    imgUrl.value = ''
  }
})


const triggerFileInput = () => {
  document.getElementById("cover-file-input").click();
};

const selectCover = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImgFile.value = file;
    imgUrl.value = URL.createObjectURL(file);
  }
};

const upload = async () => {
    // 设置专辑关联的歌手 ID
    currentAlbum.value.artist.id = selectedArtist.value.id;

    // 如果是编辑模式，并且存在旧封面，则先删除旧封面
    if (props.mode === "edit" && currentAlbum.value.coverUrl) {
      await apiDeleteCoverFileById(currentAlbum.value.id);
    }

    // 创建或更新专辑
    if (props.mode === "create") {
      const res = await apiCreateAlbum(currentAlbum.value);
      if (selectedImgFile.value) {
        await apiUploadCoverFile(res.data.id, selectedImgFile.value);
      }
      emit("albumCreated", res.data);
    } else {
      await apiUpdateAlbum(currentAlbum.value);
      if (selectedImgFile.value) {
        await apiUploadCoverFile(currentAlbum.value.id, selectedImgFile.value);
      }
      emit("albumUpdated", currentAlbum.value);
    }

    alert("操作成功！");
    visible.value = false;

};

const handleArtistCreated = async (newArtist) => {
  await getAllArtists();
  selectedArtist.value = artists.value.find(a => a.id === newArtist.id);
};

const artistAvatarUrls = ref([]);
onMounted(async () => {
  await getAllArtists();
  for(let i = 0; i < artists.value.length; i++) {
    artistAvatarUrls.value[artists.value[i].id] = await apiGetArtistAvatarFileUrl(artists.value[i].avatarUrl);
  }
})

</script>

<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ mode === 'edit' ? '编辑专辑' : '新建专辑' }}</span>
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
          <input id="cover-file-input" type="file" @change="selectCover" accept="image/*" style="display: none;"/>
        </div>

        <v-text-field v-model="currentAlbum.title" label="专辑名" outlined/>
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
              :src="artistAvatarUrls[selectedArtist.id]"
              width="100"
              height="100"
              cover
              class="mx-auto rounded"
          />
        </div>

        <v-textarea v-model="currentAlbum.description" label="简介" outlined auto-grow/>
        <v-text-field
            v-model="currentAlbum.releaseDate"
            label="发行日期"
            type="date"
            outlined
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="upload">确认</v-btn>
      </v-card-actions>
    </v-card>

    <artist-modal
        v-if="artistModalVisible"
        v-model="artistModalVisible"
        @artist-created="handleArtistCreated"
    />

    <!-- 添加评论区组件 -->
    <div v-if="currentAlbum && currentAlbum.id">
      <CommentSection content-type="album" :content-id="currentAlbum.id" />
    </div>
  </v-dialog>
</template>
