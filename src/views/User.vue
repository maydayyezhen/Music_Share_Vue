<script setup>
import {useAuthStore} from "@/stores/authStore.js";
const authStore = useAuthStore();
</script>

<template>
  <h1>你好，{{authStore.user.nickname}}！</h1>
</template>

<style scoped>

</style>