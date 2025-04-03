import { defineStore } from 'pinia';
import { ref } from 'vue';
import {Song} from "@/models/song.js";

export const musicStore = defineStore('music', () => {
    const currentSong = ref({...Song});
    const setCurrentSong = (song) => {
        currentSong.value = {...song};
    }
    return {
        currentSong,
        setCurrentSong
    }
});