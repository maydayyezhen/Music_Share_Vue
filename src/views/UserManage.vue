<template>
  <div>
    <!-- 歌手选择框 -->
    <v-select
        v-model="selectedArtist"
        :items="artists"
        item-title="name"
        label="选择歌手"
        @click="onArtistChange"
        return-object
        outlined
    ></v-select>

    <!-- 专辑选择框 -->
    <v-select
        v-model="selectedAlbum"
        :items="albums"
        item-title="name"
        label="选择专辑"
        outlined
        :disabled="!selectedArtist"
    ></v-select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedArtist: null,  // 当前选中的歌手对象
      selectedAlbum: null,   // 当前选中的专辑对象
      artists: [
        { id: 1, name: 'Taylor Swift' },
        { id: 2, name: 'The Sundays' }
      ],
      albums: []  // 存储与选中歌手相关的专辑
    };
  },
  methods: {
    // 当选择歌手时更新专辑列表
    async onArtistChange() {
      // 模拟获取选中歌手的专辑（你可以替换为 API 请求）
      if (this.selectedArtist) {
        this.albums = await this.getAlbumsByArtist(this.selectedArtist.id);
        // 如果有专辑，自动选择第一个专辑
        if (this.albums.length > 0) {
          this.selectedAlbum = this.albums[0];
        } else {
          this.selectedAlbum = null;
        }
      } else {
        this.albums = [];
        this.selectedAlbum = null;
      }
    },

    // 模拟根据歌手获取专辑的函数
    async getAlbumsByArtist(artistId) {
      // 你可以根据 artistId 来从 API 获取专辑数据
      const albums = {
        1: [
          { id: 1, name: 'Red' },
          { id: 2, name: '1989' }
        ],
        2: [
          { id: 3, name: 'Reading, Writing, and Arithmetic' },
          { id: 4, name: 'Static & Silence' }
        ]
      };
      return albums[artistId] || [];
    }
  }
};
</script>








