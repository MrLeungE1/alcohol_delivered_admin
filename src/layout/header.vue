<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="layout-header">
    <div class="header-left">
      <div>
        <h1 class="header-logo">酒水配送管理系统</h1>
        <p class="header-subtitle">商品、分类、活动内容统一维护</p>
      </div>
    </div>
    <div class="header-right">
      <span class="header-user">{{ auth.username }}</span>
      <button class="header-logout" type="button" @click="logout">退出登录</button>
    </div>
  </header>
</template>

<style scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 68px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(10px);
}

.header-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-h);
  margin: 0;
}

.header-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-user {
  font-size: 14px;
  color: var(--text-h);
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
}

.header-logout {
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.header-logout:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}
</style>
