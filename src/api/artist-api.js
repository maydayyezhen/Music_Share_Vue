import axios from 'axios';
import {apiGetFileUrl} from "@/api/file-api.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


//GET
//获取所有歌手
export const apiGetAllArtists = () => {
    return axios.get(`${API_BASE_URL}/artists`);
}
export const apiGetArtistById = (id) => {
    return axios.get(`${API_BASE_URL}/artists/${id}`);
}


//POST
//创建歌手
export const apiCreateArtist = (artistData) => {
    return axios.post(`${API_BASE_URL}/artists`, artistData);
}
//上传歌手头像
export const apiUploadAvatarFile = (id, avatarFile) => {
    const formData = new FormData();
    formData.append('avatarFile', avatarFile);
    return axios.post(`${API_BASE_URL}/artists/${id}/avatarFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

//DELETE
//删除歌手
export const apiDeleteArtistById = (id) => {
    return axios.delete(`${API_BASE_URL}/artists/${id}`);
}
//删除歌手头像
export const apiDeleteAvatarFileById = (id) => {
    return axios.delete(`${API_BASE_URL}/artists/${id}/avatarFile`);
}

export const apiUpdateArtist = (artistData) =>{
    return axios.put(`${API_BASE_URL}/artists`,artistData)
}

//获取歌手头像URL
export  const apiGetArtistAvatarFileUrl = (fileUrl) => {
    return apiGetFileUrl(fileUrl);
}