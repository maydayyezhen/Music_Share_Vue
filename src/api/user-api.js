import axios from './axiosInstance';
import { apiGetFileUrl } from "@/api/file-api.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


//GET
export const apiGetUserByUsername = (username) => {
    return axios.get(`/users/${username}`, {
        withCredentials: true
    });
};



//POST
export const apiRegister = (name,password) => {
    return axios.post(`/users/register`, null, {
        params: { name, password }
    }
    )
}
export const apiLogin = (username, password, rememberMe = true) => {
    // 构建表单数据
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('remember-me',  rememberMe.toString());  // 添加 remember-me 参数

    return axios.post(`/login`, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // 设置表单数据的 Content-Type
        },
        withCredentials: true,  // 确保携带 Cookie
    });
};

export const apiLogout = () => {
    return axios.post(`/logout`, null, {
        withCredentials: true
    }
    )
}

// GET
// 获取所有用户
export const apiGetAllUsers = () => {
    return axios.get(`/users`);
};

// 上传头像文件
export const apiUploadAvatarFile = (name, avatarFile) => {
    const formData = new FormData();
    formData.append('avatarFile', avatarFile);
    return axios.post(`/users/${name}/avatarFile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// PUT
// 更新用户信息
export const apiUpdateUser = (name, nickname) => {
    return axios.put(`/users/${name}`, null, {
        params: { nickname }
    });
};

// 更新密码
export const apiUpdatePassword = (name, oldPassword, newPassword) => {
    return axios.put(`/users/${name}/password`, null, {
        params: { oldPassword, newPassword }
    });
};

// DELETE
// 删除用户
export const apiDeleteUserById = (name) => {
    return axios.delete(`/users/${name}`);
};

// 删除头像文件
export const apiDeleteAvatarFileById = (name) => {
    return axios.delete(`/users/${name}/avatarFile`);
};

// 文件操作
// 获取头像URL
export const apiGetAvatarFileUrl = (fileUrl) => {
    return apiGetFileUrl(fileUrl);
};

// 通过用户ID获取头像URL
export const apiGetAvatarFileUrlByUserId = async (name) => {
    if (id === null) return '';
    const response = await axios.get(`/users/${name}/avatarUrl`);
    return `${API_BASE_URL}/${response.data}`;
};

// 更新角色
export const apiUpdateRole = (name, updateName, role) => {
    return axios.put(`/users/${name}/manage`, null, {
        params: { updateName, role }
    });
};

