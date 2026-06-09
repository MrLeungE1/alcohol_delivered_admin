<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuList = [
  { path: '/dashboard', title: '首页', icon: '📊' },
  { path: '/order', title: '订单管理', icon: '📋' },
  { path: '/product', title: '商品管理', icon: '🍺' },
  { path: '/category', title: '分类管理', icon: '🧾' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="layout-aside">
    <nav class="aside-nav">
      <div
        v-for="item in menuList"
        :key="item.path"
        class="aside-item"
        :class="{ active: isActive(item.path) }"
        @click="navigate(item.path)"
      >
        <span class="aside-icon">{{ item.icon }}</span>
        <span class="aside-title">{{ item.title }}</span>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.layout-aside {
  width: 220px;
  min-height: calc(100vh - 60px);
  background: #fff;
  border-right: 1px solid var(--border);
  padding: 16px 0;
}

.aside-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.aside-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}

.aside-item:hover {
  background: var(--accent-bg);
  color: var(--accent);
}

.aside-item.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}

.aside-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.aside-title {
  white-space: nowrap;
}
</style>
