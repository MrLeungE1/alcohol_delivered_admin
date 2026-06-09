<script setup lang="ts">
</script>

<template>
  <main class="layout-main">
    <router-view />
  </main>
</template>

<style scoped>
.layout-main {
  flex: 1;
  padding: 24px;
  background: var(--bg);
  overflow-y: auto;
  min-height: calc(100vh - 60px);
}
</style>