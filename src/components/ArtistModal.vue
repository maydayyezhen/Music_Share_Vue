<script setup>
import { ref, watch, onMounted } from 'vue'
import { apiCreateArtist, apiUpdateArtist, apiUploadAvatarFile } from '@/api/artist-api.js'
import { Artist } from '@/models/artist.js'

const props = defineProps({
  modelValue: Boolean,
  artistData: {
    type: Object,
    default: () => ({ ...Artist })
  },
  mode: {
    type: String,
    default: 'create' // or 'edit'
  }
})

const emit = defineEmits(['update:modelValue', 'artist-created', 'artist-updated'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, val => (visible.value = val))
watch(visible, val => emit('update:modelValue', val))

const currentArtist = ref({ ...Artist })
const selectedAvatarFile = ref(null)
const avatarUrl = ref('')

// 初始化 artistData
watch(
    () => props.artistData,
    (newArtist) => {
      if (props.mode === 'edit' && newArtist) {
        currentArtist.value = { ...newArtist }
        avatarUrl.value = newArtist.avatarUrl
      } else {
        currentArtist.value = { ...Artist }
        avatarUrl.value = ''
      }
    },
    { immediate: true }
)

const triggerFileInput = () => {
  document.getElementById("avatar-file-input").click()
}

const selectAvatar = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedAvatarFile.value = file
    avatarUrl.value = URL.createObjectURL(file)
  }
}

const upload = async () => {
  try {
    if (props.mode === 'create') {
      const { data } = await apiCreateArtist(currentArtist.value)
      selectedAvatarFile.value && await apiUploadAvatarFile(data.id, selectedAvatarFile.value)
      emit('artist-created', data)
    } else {
      await apiUpdateArtist(currentArtist.value)
      selectedAvatarFile.value && await apiUploadAvatarFile(currentArtist.value.id, selectedAvatarFile.value)
      emit('artist-updated', currentArtist.value)
    }

    alert("操作成功！")
    visible.value = false
  } catch (e) {
    console.error(e)
    alert("操作失败，请查看控制台日志")
  }
}


</script>

<template>
  <v-dialog v-model="visible" max-width="500px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ mode === 'edit' ? '编辑歌手' : '添加歌手' }}</span>
        <v-btn icon @click="visible = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text>
        <div class="text-center mb-4">
          <v-img
              v-if="avatarUrl"
              :src="avatarUrl"
              width="100"
              height="100"
              class="mx-auto rounded"
              cover
              @click="triggerFileInput"
          />
          <v-btn v-else @click="triggerFileInput" color="primary">上传头像</v-btn>
          <input id="avatar-file-input" type="file" accept="image/*" @change="selectAvatar" style="display: none;" />
        </div>

        <v-text-field v-model="currentArtist.name" label="歌手名" outlined />
        <v-textarea v-model="currentArtist.bio" label="简介" auto-grow outlined />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="upload">确认</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
