<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useAuthStore } from "@/stores/authStore.js";
    import { useRouter } from 'vue-router';
    import { apiGetAllUsers, apiUpdateRole } from "@/api/user-api.js";

    const authStore = useAuthStore();
    const router = useRouter();

    // 数据状态
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const successMessage = ref(null);

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
        } finally {
            loading.value = false;
        }
    };

    // 更新用户角色
    const updateUserRole = async (username, newRole) => {
        if (!confirm(`确定要将用户 ${username} 的角色修改为 ${newRole} 吗？`)) return;

        try {
            loading.value = true;
            await apiUpdateRole(authStore.user.username, username, newRole);
            successMessage.value = `用户 ${username} 的角色已成功更新为 ${newRole}`;

            // 刷新用户列表
            await fetchUsers();

            // 3秒后自动清除成功消息
            setTimeout(() => {
                successMessage.value = null;
            }, 3000);
        } catch (err) {
            error.value = '更新角色失败: ' + (err.response?.data?.message || err.message);
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
    <div class="user-role-management">
        <h2>用户角色管理</h2>

        <!-- 操作提示和状态信息 -->
        <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
        </div>
        <div v-if="error" class="alert alert-error">
            {{ error }}
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-indicator">
            加载中...
        </div>

        <!-- 用户列表表格 -->
        <table v-else class="user-table">
            <thead>
                <tr>
                    <th>用户名</th>
                    <th>昵称</th>
                    <th>当前角色</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in filteredUsers" :key="user.username">
                    <td>{{ user.username }}</td>
                    <td>{{ user.nickname || 'N/A' }}</td>
                    <td>{{ user.role }}</td>
                    <td class="actions">
                        <select v-model="user.role"
                                @change="updateUserRole(user.username, user.role)"
                                class="role-select">
                            <option value="user">普通用户</option>
                            <option value="admin">管理员</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="filteredUsers.length === 0" class="empty-message">
            没有其他用户可管理
        </div>
    </div>
</template>

<style scoped>
    .user-role-management {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
    }

    h2 {
        text-align: center;
        margin-bottom: 20px;
        color: #333;
    }

    .alert {
        padding: 10px 15px;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .alert-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .alert-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .loading-indicator {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    .user-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

        .user-table th,
        .user-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .user-table th {
            background-color: #f5f5f5;
            font-weight: 600;
        }

        .user-table tr:hover {
            background-color: #f9f9f9;
        }

    .actions {
        min-width: 150px;
    }

    .role-select {
        padding: 6px 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background-color: white;
        cursor: pointer;
        transition: all 0.3s;
    }

        .role-select:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }

    .empty-message {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
    }
</style>
