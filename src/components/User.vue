<script setup>
import Layout from '../components/Layout.vue'
import {useAuthStore} from "@/stores/authStore.js";
const authStore = useAuthStore();
</script>

<template>
  <Layout/>
  <h1>你好，{{authStore.user.nickname}}！</h1>
</template>

<style scoped>

</style>