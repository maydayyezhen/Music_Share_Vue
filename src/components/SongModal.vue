<script setup>
import { onMounted, ref, watch } from "vue";
import ArtistModal from "@/components/ArtistModal.vue";
import AlbumModal from "@/components/AlbumModal.vue";
import {
  apiGetAlbumsByArtistId,
  apiGetAllAlbums,
  apiGetCoverFileUrl
} from "@/api/album-api.js";
import {
  apiGetAllArtists,
  apiGetArtistAvatarFileUrl
} from "@/api/artist-api.js";
import {
  apiCreateSong,
  apiUpdateSong,
  apiUploadAudioFile,
  apiUploadLrcFile
} from "@/api/song-api.js";
import { Artist } from "@/models/artist.js";
import { Album } from "@/models/album.js";
import { Song } from "@/models/song.js";

const props = defineProps({
  song: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const artists = ref([{ ...Artist }])
const albums = ref([{ ...Album }])
const selectedArtist = ref(null)
const selectedAlbum = ref(null)
const artistSelect = ref(null)

const newSongRef = ref({ ...Song })

const getAllArtists = async () => {
  const response = await apiGetAllArtists()
  artists.value = response.data
}

const getAllAlbums = async () => {
  const response = await apiGetAllAlbums()
  albums.value = response.data
}

const getAlbumsByArtistId = async (artistId) => {
  const response = await apiGetAlbumsByArtistId(artistId)
  albums.value = response.data
}

const onArtistChange = async () => {
  selectedAlbum.value = null
  await getAlbumsByArtistId(selectedArtist.value.id)
  selectedAlbum.value = albums.value[0]
  artistSelect.value.menu = false
}

const handelAlbumCreated = async (newAlbum) => {
  await getAllArtists()
  selectedArtist.value = artists.value.find(artist => artist.id === newAlbum.artist.id)
  await getAlbumsByArtistId(selectedArtist.value.id)
  selectedAlbum.value = albums.value.find(album => album.id === newAlbum.id)
}

const handelArtistCreated = async (newArtist) => {
  await getAllArtists()
  selectedArtist.value = artists.value.find(artist => artist.id === newArtist.id)
  await getAlbumsByArtistId(selectedArtist.value.id)
  selectedAlbum.value = null
}

const selectedAudioFile = ref(null)
const selectedLrcFile = ref(null)
const formattedDuration = ref(null)
const duration = ref()
const audio = new Audio()

const selectAudioFile = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedAudioFile.value = file
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      duration.value = audio.duration
      formattedDuration.value = formatDuration(audio.duration)
    }
  }
}

const selectLrcFile = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedLrcFile.value = file
  }
}

const formatDuration = (dur) => {
  const minutes = Math.floor(dur / 60)
  const seconds = Math.floor(dur % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const resetForm = () => {
  newSongRef.value = { ...Song }
  selectedArtist.value = null
  selectedAlbum.value = null
  formattedDuration.value = null
  duration.value = null
  selectedAudioFile.value = null
  selectedLrcFile.value = null
}

watch(
    () => props.song,
    async (newSong) => {
      if (newSong) {
        newSongRef.value = { ...newSong }
        duration.value = newSong.duration
        formattedDuration.value = formatDuration(newSong.duration)

        selectedArtist.value = newSong.artist
        await getAlbumsByArtistId(newSong.artist.id)
        selectedAlbum.value = albums.value.find(album => album.id === newSong.album.id)
      } else {
        resetForm()
      }
    },
    { immediate: true }
)

const upload = async () => {
  newSongRef.value.artist.id = selectedArtist.value.id
  newSongRef.value.album.id = selectedAlbum.value.id
  newSongRef.value.duration = duration.value

  let response
  if (props.song) {
    response = await apiUpdateSong(newSongRef.value)
  } else {
    response = await apiCreateSong(newSongRef.value)
  }

  if (selectedLrcFile.value) {
    await apiUploadLrcFile(response.data.id, selectedLrcFile.value)
  }
  if (selectedAudioFile.value) {
    await apiUploadAudioFile(response.data.id, selectedAudioFile.value)
  }

  alert(props.song ? "修改成功" : "上传成功")
  visible.value = false
  emit("close")
}

const artistModalVisible = ref(false)
const createDialogVisible = ref(false)

onMounted(getAllArtists)
onMounted(getAllAlbums)

const visible = defineModel('visible')
</script>

<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="auto">
            <span class="headline">{{ props.song ? '编辑音乐' : '添加音乐' }}</span>
          </v-col>
          <v-col cols="auto" class="ml-auto">
            <v-btn variant="text" icon @click="visible = false">
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
                v-model="newSongRef.title"
                label="歌曲名"
                placeholder="输入歌曲名"
                style="width: 200px"
            />
          </v-col>
        </v-row>

        <v-row align="center" justify="center" style="gap: 16px;">
          <v-col cols="auto">
            <v-autocomplete
                variant="outlined"
                color="primary"
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
                <v-btn @click="artistModalVisible = true" color="primary" size="small" block>
                  + 添加歌手
                </v-btn>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar size="30" class="mr-2">
                      <v-img :src="apiGetArtistAvatarFileUrl(item.raw.avatarUrl)" />
                    </v-avatar>
                  </template>
                  <template v-slot:title>{{ item.raw.name }}</template>
                </v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <v-avatar size="30" class="mr-2">
                  <v-img :src="apiGetArtistAvatarFileUrl(item.raw.avatarUrl)" />
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
                v-model="selectedAlbum"
                :items="albums"
                item-title="title"
                return-object
                label="选择专辑"
                style="width: 300px"
            >
              <template v-slot:prepend-item>
                <v-btn @click="createDialogVisible = true" color="primary" size="small" block>
                  + 添加专辑
                </v-btn>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar size="30" class="mr-2" :rounded="0">
                      <v-img :src="apiGetCoverFileUrl(item.raw.coverUrl)" />
                    </v-avatar>
                  </template>
                  <template v-slot:title>{{ item.raw.title }}</template>
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
            v-model="formattedDuration"
            label="时长（mm:ss）"
            readonly
        />

        <v-file-input
            variant="outlined"
            color="primary"
            id="audio-file-input"
            label="选择音频文件"
            accept="audio/*"
            @change="selectAudioFile"
        />

        <v-file-input
            variant="outlined"
            color="primary"
            id="lyrics-file-input"
            label="选择歌词文件"
            accept=".lrc,.txt"
            @change="selectLrcFile"
        />

        <v-textarea
            variant="outlined"
            color="primary"
            v-model="newSongRef.lyrics"
            label="歌词"
            placeholder="请输入歌词"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" @click="upload">
          {{ props.song ? '保存修改' : '上传' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <artist-modal
      v-if="artistModalVisible"
      v-model="artistModalVisible"
      @artist-created="handelArtistCreated"
  />
  <album-modal
      v-if="createDialogVisible"
      v-model="createDialogVisible"
      :album-data="{ ...Album }"
      mode="create"
      @album-created="handelAlbumCreated"
  />
</template>

<style scoped>
</style>
