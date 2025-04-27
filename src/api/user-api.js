import axios from './axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


//GET
export const apiGetUserByUsername = (username) => {
    return axios.get(`/users/${username}`, {
    });
};



//POST
export const apiRegister = (name,password) => {
    return axios.post(`/users/register`, null, {
        params: { name, password }
    }
    )
}

export const apiLogin = async (username, password) => {
    try {
        const response = await axios.post('/users/login', { // 使用 POST 请求的 body
            username: username,  // 传递用户名
            password: password   // 传递密码
        });
        return response.data.token;
    } catch (error) {
        console.error('登录失败', error);
        alert('登录失败，请检查用户名和密码');
    }
};




export const apiLogout = () => {
    return axios.post(`/users/logout`)
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
export const apiGetUserAvatarFileUrl = async (fileUrl) => {
    const res = await axios.get(fileUrl, {
        responseType: 'blob',
    })
    return URL.createObjectURL(res.data)
};

// 更新角色
export const apiUpdateRole = (name, updateName, role) => {
    return axios.put(`/users/${name}/manage`, null, {
        params: { updateName, role }
    });
};

