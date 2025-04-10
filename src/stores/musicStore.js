import { defineStore } from 'pinia';
import { ref } from 'vue';
import {Song} from "@/models/song.js";

export const useMusicStore = defineStore('music', () => {
    const currentSongIndex = ref(0);
    const currentPlaylist = ref([]);
    const currentSong = ref({...Song});
    const audio = ref(null);
    const isPlaying = ref(false);

    const setCurrentPlayList = (playlist) => {
        currentPlaylist.value = JSON.parse(JSON.stringify(playlist))
    }
    const setCurrentSong = (index) => {
        currentSongIndex.value = index;
        currentSong.value = currentPlaylist.value[index];
    }

    const setAudio = (audioElement) => {
        audio.value = audioElement;
    }

    const play = () => {
        if (audio.value) {
            audio.value.play();
          isPlaying.value = true;
        }
    }
    const pause = () => {
        if (audio.value) {
            audio.value.pause();
          isPlaying.value = false;
        }
    }

    const deleteSongFromPlaylist = (index) => {
        currentPlaylist.value.splice(index, 1);
        if (currentSongIndex.value >= currentPlaylist.value.length) {
            currentSongIndex.value = currentPlaylist.value.length - 1;
        }
        if (currentPlaylist.value.length === 0) {
            currentSong.value = {...Song};
        }
        else {
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
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
      deleteSongFromPlaylist,
      setAudio,
      audio,
      play,
      pause,
      isPlaying
    }
});