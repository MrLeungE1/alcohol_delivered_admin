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
      <h1 class="header-logo">酒水配送管理系统</h1>
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
  height: 60px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-logo {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-user {
  font-size: 14px;
  color: var(--text);
}

.header-logout {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
}

.header-logout:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
