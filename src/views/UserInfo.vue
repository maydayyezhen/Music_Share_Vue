<script setup>
    import { onMounted, ref } from 'vue';
    import { useAuthStore} from "@/stores/authStore.js";
    import { apiUpdateUser, apiUpdatePassword, apiUploadAvatarFile } from "@/api/user-api.js";
    
    const authStore = useAuthStore();
    const user = authStore.user;
    // 对话框控制
    const showDialog = ref(false);

    // 表单数据
    const formData = ref({
        nickname: authStore.user.nickname || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const selectedImgFile = ref(null);


    const triggerFileInput = () => {
        document.getElementById('avatar-file-input').click();
    };

    const selectAvatar = (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedImgFile.value = file;
            authStore.user.avatarUrl = URL.createObjectURL(file);
            console.log("📂 选中文件:", file.name);
        } else {
            console.warn("⚠ 没有选中文件");
        }
    };

    const upload = async () => {
        await apiUploadAvatarFile(authStore.user.username, selectedImgFile.value);

        alert("上传成功");
        visible.value = false;
    }

    const visible = defineModel('visible')
    // 打开对话框
    const openDialog = () => {
        formData.value = {
            nickname: authStore.user.nickname || '',
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        showDialog.value = true;
    };

    // 提交表单
    const submitForm = async () => {
        try {
            // 更新昵称
            if (formData.value.nickname !== authStore.user.nickname) {
                await apiUpdateUser(authStore.user.username, formData.value.nickname);
                authStore.user.nickname = formData.value.nickname;
            }

            // 更新密码
            if (formData.value.newPassword) {
                if (formData.value.newPassword !== formData.value.confirmPassword) {
                    throw new Error('两次输入的新密码不一致');
                }
                await apiUpdatePassword(
                    authStore.user.username,
                    formData.value.oldPassword,
                    formData.value.newPassword
                );
            }

            alert('个人信息更新成功');
            showDialog.value = false;
        } catch (error) {

            alert(`更新失败: ${error.message}`);
        }
    }
    onMounted(async () => {
         if (!authStore.user?.username) {
    console.error('用户名不存在');
    return;
  }
  try {
    await authStore.fetchUser(authStore.user.username)
  } catch (error) {
    console.error('获取用户失败:', error)
  }
})


</script>

<template>
    <div class="user-profile-container">
        <div class="user-profile-card">
            <h2>个人信息</h2>

            <div class="user-info">
                <div class="text-center mb-4">
                    <v-img v-if="authStore.user.avatarUrl"
                           :src="authStore.user.avatarUrl"
                           class="mx-auto"
                           width="200"
                           height="200"
                           cover
                           @click="triggerFileInput"></v-img>
                    <v-btn v-else @click="triggerFileInput" color="primary">点击上传</v-btn>
                    <input id="avatar-file-input" type="file" ref="fileInput" @change="selectAvatar" accept="image/*" style="display: none;" />
                </div>

                <div class="user-details">
                    <div class="detail-item">
                        <span class="detail-label">用户ID:</span>
                        <span class="detail-value">{{ authStore.user.id || 'N/A' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">用户名:</span>
                        <span class="detail-value">{{ authStore.user.username }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">用户昵称:</span>
                        <span class="detail-value">{{ authStore.user.nickname || 'N/A' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">用户角色:</span>
                        <span class="detail-value">{{ authStore.user.role }}</span>
                    </div>
                </div>
            </div>

            <button @click="openDialog" class="edit-button">
                更改个人信息
            </button>
            <v-btn @click="upload" color="primary" block class="mt-4">上传</v-btn>
        </div>

        <!-- 编辑对话框 -->
        <div v-if="showDialog" class="dialog-overlay">
            <div class="dialog-content">
                <h3>编辑个人信息</h3>

                <div class="form-group">
                    <label for="nickname">昵称</label>
                    <input type="text" id="nickname" v-model="formData.nickname" class="form-input">
                </div>

                <div class="form-group">
                    <label for="oldPassword">旧密码</label>
                    <input type="password" id="oldPassword" v-model="formData.oldPassword" class="form-input" placeholder="留空则不修改">
                </div>

                <div class="form-group">
                    <label for="newPassword">新密码</label>
                    <input type="password" id="newPassword" v-model="formData.newPassword" class="form-input" placeholder="留空则不修改">
                </div>

                <div class="form-group">
                    <label for="confirmPassword">确认新密码</label>
                    <input type="password" id="confirmPassword" v-model="formData.confirmPassword" class="form-input" placeholder="留空则不修改">
                </div>

                <div class="dialog-actions">
                    <button @click="showDialog = false" class="cancel-btn">取消</button>
                    <button @click="submitForm" class="submit-btn">保存</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .user-profile-container {
        display: flex;
        justify-content: center;
        padding: 2rem;
        position: relative;
    }

    .user-profile-card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        width: 100%;
        max-width: 600px;
    }

        .user-profile-card h2 {
            margin-bottom: 1.5rem;
            color: #333;
            text-align: center;
        }

    .user-info {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .avatar-container {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder {
        font-size: 3rem;
        font-weight: bold;
        color: #666;
    }

    .user-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .detail-item {
        display: flex;
        align-items: center;
    }

    .detail-label {
        font-weight: 600;
        min-width: 100px;
        color: #555;
    }

    .detail-value {
        padding: 0.5rem;
        background: #f8f8f8;
        border-radius: 4px;
        flex: 1;
    }

    .edit-button {
        display: block;
        width: 100%;
        padding: 0.75rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

        .edit-button:hover {
            background-color: #45a049;
        }

    /* 对话框样式 */
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .dialog-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

        .dialog-content h3 {
            margin-top: 0;
            margin-bottom: 1.5rem;
            text-align: center;
        }

    .avatar-upload {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .avatar-preview {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-bottom: 1rem;
    }

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .upload-btn {
        padding: 0.5rem 1rem;
        background-color: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

        .upload-btn:hover {
            background-color: #e0e0e0;
        }

    .form-group {
        margin-bottom: 1rem;
    }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

    .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .cancel-btn, .submit-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .cancel-btn {
        background-color: #f0f0f0;
    }

        .cancel-btn:hover {
            background-color: #e0e0e0;
        }

    .submit-btn {
        background-color: #4CAF50;
        color: white;
    }

        .submit-btn:hover {
            background-color: #45a049;
        }
</style>
