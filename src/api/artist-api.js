import axios from 'axios';
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
export const apiDeleteArtist = (id) => {
    return axios.delete(`${API_BASE_URL}/artists/${id}`);
}
//删除歌手头像
export const apiDeleteAvatarFile = (path) => {
    return axios.delete(`${API_BASE_URL}/artists/delete`, {
        params: { path: path }
    });
}


//获取歌手头像URL
export  const apiGetArtistAvatarFileUrl = (fileUrl) => {
    if(fileUrl==="")
        return '';
    return `${API_BASE_URL}/${fileUrl}`;
}