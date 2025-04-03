import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//GET
//获取所有歌曲
export const apiGetAllSongs = () => {
    return axios.get(`${API_BASE_URL}/songs`);
};


//POST
//创建歌曲
export const apiCreateSong = (songData) => {
    return axios.post(`${API_BASE_URL}/songs`, songData);
};
//上传音频文件
export const apiUploadAudioFile = (audioFile) => {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    return axios.post(`${API_BASE_URL}/songs/audioFile`, formData,{
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


//文件操作
//获取音频URL
export const apiGetAudioFileUrlById = (id) => {
    return `${API_BASE_URL}/songs/${id}/audioFile`;
}
//通过歌曲ID获取封面URL
export const apiGetCoverFileUrlBySongId = (id) => {
    return `${API_BASE_URL}/songs/${id}/coverFile`;
}


