import axios from 'axios';
import { apiGetFileUrl } from "@/api/file-api.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


//GET
export const apiGetUserByUsername = (username) => {
    return axios.get(`${API_BASE_URL}/users/${username}`);
}


//POST
export const apiCreateUser = (userData) => {
    return axios.post(`${API_BASE_URL}/users`, userData);
}

// GET
// 获取所有用户
export const apiGetAllUsers = () => {
    return axios.get(`${API_BASE_URL}/users`);
};

// 上传头像文件
export const apiUploadAvatarFile = (name, avatarFile) => {
    const formData = new FormData();
    formData.append('avatarFile', avatarFile);
    return axios.post(`${API_BASE_URL}/users/${name}/avatarFile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// PUT
// 更新用户信息
export const apiUpdateUser = (name, nickname) => {
    return axios.put(`${API_BASE_URL}/users/${name}`, null, {
        params: { nickname }
    });
};

// 更新密码
export const apiUpdatePassword = (name, oldPassword, newPassword) => {
    return axios.put(`${API_BASE_URL}/users/${name}/password`, null, {
        params: { oldPassword, newPassword }
    });
};

// DELETE
// 删除用户
export const apiDeleteUserById = (name) => {
    return axios.delete(`${API_BASE_URL}/users/${name}`);
};

// 删除头像文件
export const apiDeleteAvatarFileById = (name) => {
    return axios.delete(`${API_BASE_URL}/users/${name}/avatarFile`);
};

// 文件操作
// 获取头像URL
export const apiGetAvatarFileUrl = (fileUrl) => {
    return apiGetFileUrl(fileUrl);
};

// 通过用户ID获取头像URL
export const apiGetAvatarFileUrlByUserId = async (name) => {
    if (id === null) return '';
    const response = await axios.get(`${API_BASE_URL}/users/${name}/avatarUrl`);
    return `${API_BASE_URL}/${response.data}`;
};

// 更新角色
export const apiUpdateRole = (name, updateName, role) => {
    return axios.put(`${API_BASE_URL}/users/${name}/manage`, null, {
        params: { updateName, role }
    });
};

