<script setup>
import Layout from '../components/Layout.vue'
import {useAuthStore} from "@/stores/authStore.js";
const authStore = useAuthStore();
</script>

<template>
  <Layout/>
  你好，管理员！{{authStore.user.username}}
</template>

<style scoped>

</style>