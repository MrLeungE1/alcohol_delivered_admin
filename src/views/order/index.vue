<template>
  <div class="page">
    <div class="title">订单管理</div>
    <div class="card">
      <div class="text">后端订单相关接口尚未在 openapi.json 中提供，前端页面已预留。</div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}

.text {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}
</style>
