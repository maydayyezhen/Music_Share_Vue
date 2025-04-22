<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useAuthStore } from "@/stores/authStore.js";
    import { apiGetAllUsers, apiUpdateRole } from "@/api/user-api.js";

    const authStore = useAuthStore();

    // 数据状态
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const successMessage = ref(null);
    const snackbar = ref(false);

    // 获取所有用户
    const fetchUsers = async () => {
        try {
            loading.value = true;
            const response = await apiGetAllUsers();
            users.value = response.data;
            error.value = null;
        } catch (err) {
            error.value = '获取用户列表失败: ' + (err.response?.data?.message || err.message);
            users.value = [];
            snackbar.value = true;
        } finally {
            loading.value = false;
        }
    };

    // 更新用户角色
    const updateUserRole = async (username, newRole) => {
        try {
            loading.value = true;
            await apiUpdateRole(authStore.user.username, username, newRole);
            successMessage.value = `用户 ${username} 的角色已成功更新为 ${newRole}`;
            snackbar.value = true;

            // 刷新用户列表
            await fetchUsers();
        } catch (err) {
            error.value = '更新角色失败: ' + (err.response?.data?.message || err.message);
            snackbar.value = true;
        } finally {
            loading.value = false;
        }
    };

    // 计算属性：过滤掉当前用户
    const filteredUsers = computed(() => {
        return users.value.filter(user => user.username !== authStore.user.username);
    });

    // 组件挂载时获取用户数据
    onMounted(() => {
        fetchUsers();
    });
</script>

<template>
    <v-container class="pa-4" max-width="1200">
        <v-card class="pa-6" elevation="4" rounded="lg">
            <v-card-title class="text-h4 text-center mb-6">
                <v-icon large class="mr-2">mdi-account-cog</v-icon>
                用户角色管理
            </v-card-title>

            <!-- 加载状态 -->
            <v-progress-linear v-if="loading"
                               indeterminate
                               color="primary"
                               class="mb-4"></v-progress-linear>

            <!-- 用户列表表格 -->
            <v-data-table v-if="!loading && filteredUsers.length > 0"
                          :headers="[
          { title: '用户名', key: 'username' },
          { title: '昵称', key: 'nickname' },
          { title: '当前角色', key: 'role' },
          { title: '操作', key: 'actions', sortable: false }
        ]"
                          :items="filteredUsers"
                          class="elevation-1">
                <template v-slot:item.nickname="{ item }">
                    {{ item.nickname || 'N/A' }}
                </template>

                <template v-slot:item.role="{ item }">
                    <v-chip :color="item.role === 'admin' ? 'primary' : 'success'">
                        {{ item.role === 'admin' ? '管理员' : '普通用户' }}
                    </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-select v-model="item.role"
                              :items="[
              { title: '普通用户', value: 'user' },
              { title: '管理员', value: 'admin' }
            ]"
                              density="compact"
                              variant="outlined"
                              @update:modelValue="updateUserRole(item.username, item.role)"
                              hide-details
                              style="max-width: 150px;"></v-select>
                </template>
            </v-data-table>

            <!-- 空状态 -->
            <v-alert v-if="!loading && filteredUsers.length === 0"
                     type="info"
                     variant="tonal"
                     class="my-4">
                没有其他用户可管理
            </v-alert>
        </v-card>

        <!-- 消息提示 -->
        <v-snackbar v-model="snackbar"
                    :timeout="3000"
                    :color="error ? 'error' : 'success'"
                    location="top">
            {{ error || successMessage }}
            <template v-slot:actions>
                <v-btn variant="text"
                       @click="snackbar = false">
                    关闭

                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<style scoped>
</style>
