import axios from 'axios';
import {apiGetFileUrl} from "@/api/file-api.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//GET
//获取所有歌曲
export const apiGetAllSongs = () => {
    return axios.get(`${API_BASE_URL}/songs`);
};
//通过歌手ID获取歌曲
export const apiGetSongsByArtistId = (id) => {
    return axios.get(`${API_BASE_URL}/songs/artist/${id}`);
}
//通过专辑ID获取歌曲
export const apiGetSongsByAlbumId = (id) => {
    return axios.get(`${API_BASE_URL}/songs/album/${id}`);
}
//通过歌曲ID获取歌曲
export const apiGetSongById = (id) => {
    return axios.get(`${API_BASE_URL}/songs/${id}`);
}

//POST
//创建歌曲
export const apiCreateSong = (songData) => {
    return axios.post(`${API_BASE_URL}/songs`, songData);
};
//上传音频文件
export const apiUploadAudioFile = (id,audioFile) => {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    return axios.post(`${API_BASE_URL}/songs/${id}/audioFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

//上传歌词文件
export const apiUploadLrcFile = (id,lrcFile) => {
    const formData = new FormData();
    formData.append('lrcFile', lrcFile);
    return axios.post(`${API_BASE_URL}/songs/${id}/lrcFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}



//PUT
//更新歌曲
export const apiUpdateSong = (songData) => {
    return axios.put(`${API_BASE_URL}/songs`, songData);
}


//DELETE
//删除歌曲
export const apiDeleteSongById = (id) => {
    return axios.delete(`${API_BASE_URL}/songs/${id}`);
}
//删除音频文件
export const apiDeleteAudioFileBySongId = (id) => {
    return axios.delete(`${API_BASE_URL}/songs/${id}/audioFile`);
}
//删除歌词文件
export const apiDeleteLrcFileBySongId = (id) => {
    return axios.delete(`${API_BASE_URL}/songs/${id}/lrcFile`);
}




//文件操作
//获取音频URL
export const apiGetAudioFileUrl = (fileUrl) => {
    return apiGetFileUrl(fileUrl);
}

//获取歌词URL
export const apiGetLyricFileUrl = (fileUrl) => {
    return apiGetFileUrl(fileUrl);
}

//通过歌曲ID获取封面URL
export const apiGetCoverFileUrlBySongId = async (id) => {
    if (id === null)
        return '';
    const response = await axios.get(`${API_BASE_URL}/songs/${id}/coverUrl`);
    return `${API_BASE_URL}/${response.data}`;
}


