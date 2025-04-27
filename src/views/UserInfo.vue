<script setup>
    import { onMounted, ref } from 'vue';
    import { useAuthStore } from "@/stores/authStore.js";
    import {apiUpdateUser, apiUpdatePassword, apiUploadAvatarFile, apiGetUserAvatarFileUrl} from "@/api/user-api.js";

    const authStore = useAuthStore();
    const user = authStore.user;
    const dialog = ref(false);
    const selectedImgFile = ref(null);

    const formData = ref({
        nickname: authStore.user.nickname || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const triggerFileInput = () => {
        document.getElementById('avatar-file-input').click();
    };

    const selectAvatar = (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedImgFile.value = file;
            userAvatarUrl.value = URL.createObjectURL(file);
            console.log("📂 选中文件:", file.name);
        } else {
            console.warn("⚠ 没有选中文件");
        }
    };

    const uploadAvatar = async () => {


        await apiUploadAvatarFile(authStore.user.username, selectedImgFile.value);
        dialog.value = false;
    };

    const openDialog = () => {
        formData.value = {
            nickname: authStore.user.nickname || '',
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        dialog.value = true;
    };

    const submitForm = async () => {
        try {
            if (selectedImgFile.value) {
                await apiUploadAvatarFile(authStore.user.username, selectedImgFile.value);
            }
            if (formData.value.nickname !== authStore.user.nickname) {
                await apiUpdateUser(authStore.user.username, formData.value.nickname);
                authStore.user.nickname = formData.value.nickname;
            }

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

            dialog.value = false;
        } catch (error) {
            console.error('更新失败:', error);
        }
    };

    const userAvatarUrl = ref('');
    onMounted(async () => {
        if (!authStore.user?.username) {
            console.error('用户名不存在');
            return;
        }
        try {
            await authStore.fetchUser(authStore.user.username);
            userAvatarUrl.value = await apiGetUserAvatarFileUrl(authStore.user.avatarUrl);
        } catch (error) {
            console.error('获取用户失败:', error);
        }
    });
</script>

<template>
    <v-container class="pa-0" max-width="md">
        <v-card class="pa-6" elevation="4" rounded="lg">
            <v-card-title class="text-h4 text-center mb-6">个人信息</v-card-title>

            <v-row align="center" class="mb-6">
                <v-col cols="12" md="4" class="text-center">
                    <v-avatar size="200" class="elevation-4">
                        <v-img v-if="userAvatarUrl"
                               :src="userAvatarUrl"
                               cover></v-img>
                        <v-icon v-else size="100" color="grey">mdi-account-circle</v-icon>
                    </v-avatar>
                    
                    <input id="avatar-file-input"
                           type="file"
                           @change="selectAvatar"
                           accept="image/*"
                           style="display: none" />
                </v-col>

                <v-col cols="12" md="8">
                    <v-list density="comfortable" class="bg-transparent">
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-list-item-title class="text-subtitle-1 font-weight-medium">用户ID:</v-list-item-title>
                            </template>
                            <v-list-item-subtitle>{{ authStore.user.id || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-list-item-title class="text-subtitle-1 font-weight-medium">用户名:</v-list-item-title>
                            </template>
                            <v-list-item-subtitle>{{ authStore.user.username }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-list-item-title class="text-subtitle-1 font-weight-medium">用户昵称:</v-list-item-title>
                            </template>
                            <v-list-item-subtitle>{{ authStore.user.nickname || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend>
                                <v-list-item-title class="text-subtitle-1 font-weight-medium">用户角色:</v-list-item-title>
                            </template>
                            <v-list-item-subtitle>{{ authStore.user.role }}</v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>

            <v-btn color="primary"
                   block
                   size="large"
                   @click="openDialog"
                   variant="tonal">
                编辑个人信息
            </v-btn>
        </v-card>

        <!-- Edit Dialog -->
        <v-dialog v-model="dialog" max-width="600">
            <v-card class="pa-6" rounded="lg">
                <v-card-title class="text-h5 text-center mb-4">编辑个人信息</v-card-title>

                <div class="text-center mb-6">
                    <v-avatar size="150" class="elevation-4 mb-4">
                        <v-img v-if="userAvatarUrl"
                               :src="userAvatarUrl"
                               cover></v-img>
                        <v-icon v-else size="80" color="grey">mdi-account-circle</v-icon>
                    </v-avatar>
                    <v-btn color="primary"
                           variant="outlined"
                           @click="triggerFileInput"
                           class="mb-2">
                        选择头像
                    </v-btn>
                    <v-btn v-if="selectedImgFile"
                           color="success"
                           variant="tonal"
                           @click="uploadAvatar"
                           class="ml-2">
                        上传头像
                    </v-btn>
                </div>

                <v-form @submit.prevent="submitForm">
                    <v-text-field v-model="formData.nickname"
                                  label="昵称"
                                  variant="outlined"
                                  class="mb-4"></v-text-field>

                    <v-text-field v-model="formData.oldPassword"
                                  label="旧密码"
                                  type="password"
                                  variant="outlined"
                                  class="mb-4"
                                  placeholder="留空则不修改"></v-text-field>

                    <v-text-field v-model="formData.newPassword"
                                  label="新密码"
                                  type="password"
                                  variant="outlined"
                                  class="mb-4"
                                  placeholder="留空则不修改"></v-text-field>

                    <v-text-field v-model="formData.confirmPassword"
                                  label="确认新密码"
                                  type="password"
                                  variant="outlined"
                                  class="mb-6"
                                  placeholder="留空则不修改"></v-text-field>

                    <v-card-actions class="justify-end">
                        <v-btn variant="text"
                               @click="dialog = false"
                               class="mr-4">
                            取消
                        </v-btn>
                        <v-btn color="primary"
                               type="submit"
                               variant="tonal">
                            保存更改
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<style scoped>
</style>
