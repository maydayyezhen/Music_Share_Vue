<script setup>
import {useAuthStore} from "@/stores/authStore.js";
const authStore = useAuthStore();
</script>

<template>
  你好，管理员！{{authStore.user.username}}
</template>

<style scoped>

</style>