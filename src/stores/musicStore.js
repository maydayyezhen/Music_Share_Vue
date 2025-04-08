import { defineStore } from 'pinia';
import { ref } from 'vue';
import {Song} from "@/models/song.js";

export const useMusicStore = defineStore('music', () => {
    const currentSongIndex = ref(0);
    const currentPlaylist = ref([]);
    const currentSong = ref({...Song});

    const setCurrentPlayList = (playlist) => {
        currentPlaylist.value = playlist;
    }
    const setCurrentSong = (index) => {
        currentSongIndex.value = index;
        currentSong.value = currentPlaylist.value[index];
    }
    const nextSong = () => {
        if (currentSongIndex.value < currentPlaylist.value.length - 1) {
            currentSongIndex.value++;
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
        else
        {
            currentSongIndex.value = 0;
            currentSong.value = currentPlaylist.value[0];
        }
    }
    const previousSong = () => {
        if (currentSongIndex.value > 0) {
            currentSongIndex.value--;
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
        else
        {
            currentSongIndex.value = currentPlaylist.value.length - 1;
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
    }
    return {
        currentSong,
        setCurrentSong,
        currentPlaylist,
      setCurrentPlayList,
      currentSongIndex,
      nextSong,
      previousSong,
    }
});