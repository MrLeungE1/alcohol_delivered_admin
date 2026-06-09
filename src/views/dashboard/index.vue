<template>
  <div class="page">
    <div class="title">首页</div>
    <div class="grid">
      <router-link class="card" to="/product">
        <div class="card-title">商品管理</div>
        <div class="card-desc">维护商品信息、上下架、库存等</div>
      </router-link>
      <router-link class="card" to="/category">
        <div class="card-title">分类管理</div>
        <div class="card-desc">维护分类、排序、启用/禁用</div>
      </router-link>
      <router-link class="card" to="/order">
        <div class="card-title">订单管理</div>
        <div class="card-desc">后端接口完善后再接入</div>
      </router-link>
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s, transform 0.2s;
}

.card:hover {
  border-color: rgba(37, 99, 235, 0.45);
  transform: translateY(-1px);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h);
}

.card-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
