<!-- src/App.vue -->
<script setup>
import { RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
</script>

<template>
  <div class="melody-app">
    <AppNavbar />
    <main class="melody-main-viewport">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.melody-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.melody-main-viewport {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
</style>