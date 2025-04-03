<script setup>
import Layout from "@/components/Layout.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
</script>

<template>
    <Layout/>
    <router-view />
    <MusicPlayer/>
</template>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

}
</style>
