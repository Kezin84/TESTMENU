<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-root">
    <RouterView />
  </div>
</template>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
}

.app-root {
  width: 100vw;
  min-height: 100vh;
}
</style>
