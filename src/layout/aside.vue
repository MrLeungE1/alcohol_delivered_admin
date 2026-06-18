<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuList = [
  { path: '/dashboard', title: '首页', icon: 'HM', desc: '经营概览' },
  { path: '/order', title: '订单管理', icon: 'OD', desc: '配送订单' },
  { path: '/product', title: '商品管理', icon: 'PD', desc: '商品与库存' },
  { path: '/category', title: '分类管理', icon: 'CT', desc: '分类排序' },
  { path: '/activity', title: '活动管理', icon: 'AC', desc: '营销活动' },
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
    <div class="aside-brand">
      <div class="aside-brand__badge">AD</div>
      <div>
        <div class="aside-brand__title">Admin Console</div>
        <div class="aside-brand__sub">酒水配送后台</div>
      </div>
    </div>
    <nav class="aside-nav">
      <div
        v-for="item in menuList"
        :key="item.path"
        class="aside-item"
        :class="{ active: isActive(item.path) }"
        @click="navigate(item.path)"
      >
        <span class="aside-icon">{{ item.icon }}</span>
        <span class="aside-copy">
          <span class="aside-title">{{ item.title }}</span>
          <span class="aside-desc">{{ item.desc }}</span>
        </span>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.layout-aside {
  width: 220px;
  min-height: calc(100vh - 60px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.98)),
    #fff;
  border-right: 1px solid var(--border);
  padding: 20px 14px;
}

.aside-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding: 0 8px 10px;
}

.aside-brand__badge {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
}

.aside-brand__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-h);
}

.aside-brand__sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.aside-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
}

.aside-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 16px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}

.aside-item:hover {
  background: rgba(37, 99, 235, 0.08);
  color: var(--accent);
}

.aside-item.active {
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(29, 78, 216, 0.06)),
    #fff;
  color: var(--accent);
  font-weight: 500;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.1);
}

.aside-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.06);
  color: currentColor;
  font-size: 12px;
  font-weight: 700;
}

.aside-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.aside-title {
  white-space: nowrap;
  font-weight: 600;
}

.aside-desc {
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 960px) {
  .layout-aside {
    width: 88px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .aside-brand,
  .aside-desc,
  .aside-title {
    display: none;
  }

  .aside-item {
    justify-content: center;
  }
}
</style>
