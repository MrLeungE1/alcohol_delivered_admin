<script setup lang="ts">
import LayoutHeader from './header.vue'
import LayoutAside from './aside.vue'
import LayoutMain from './main.vue'
</script>

<template>
  <div class="layout-container">
    <LayoutHeader />
    <div class="layout-body">
      <LayoutAside />
      <LayoutMain />
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>