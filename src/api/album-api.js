import axios from 'axios';
import {apiGetFileUrl} from "@/api/file-api.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//GET
//获取所有专辑
export const apiGetAllAlbums = () => {
    return axios.get(`${API_BASE_URL}/albums`);
};

//根据歌手ID获取专辑
export const apiGetAlbumsByArtistId = (id) => {
    return axios.get(`${API_BASE_URL}/albums/artist/${id}`);
}

//根据专辑id获取专辑
export const apiGetAlbumByAlbumId = (id) => {
    return axios.get(`${API_BASE_URL}/albums/${id}`);
}


//POST
//创建专辑
export const apiCreateAlbum = (albumData) => {
    return axios.post(`${API_BASE_URL}/albums`, albumData);
}
//上传专辑封面
export const apiUploadCoverFile = (id,coverFile) => {
    const formData = new FormData();
    formData.append('coverFile', coverFile);
    return axios.post(`${API_BASE_URL}/albums/${id}/coverFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

//PUT
export const apiUpdateAlbum = (albumData) => {
    return axios.put(`${API_BASE_URL}/albums`,albumData);
}
//DELETE
//删除专辑
export const apiDeleteAlbumById = (id) => {
    return axios.delete(`${API_BASE_URL}/albums/${id}`);
}

//删除专辑封面
export const apiDeleteCoverFileById = (id) => {
    return axios.delete(`${API_BASE_URL}/albums/${id}/coverFile`);
}

//获取封面URL
export const apiGetCoverFileUrl = (fileUrl) => {
    return apiGetFileUrl(fileUrl);
}
