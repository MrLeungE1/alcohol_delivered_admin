<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">管理后台登录</h2>
      <form class="login-form" @submit.prevent="submit">
        <label class="field">
          <span class="label">用户名</span>
          <input v-model.trim="form.username" class="input" placeholder="例如：admin" />
        </label>
        <label class="field">
          <span class="label">密码</span>
          <input
            v-model.trim="form.password"
            class="input"
            type="password"
            placeholder="请输入密码"
          />
        </label>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="tip">接口：POST /admin/sys_admin/login，成功返回 token。</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/login'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})
const loading = ref(false)

async function submit() {
  if (!form.username.trim()) {
    alert('请输入用户名')
    return
  }
  if (!form.password) {
    alert('请输入密码')
    return
  }

  loading.value = true
  try {
    const res = await login({ username: form.username.trim(), password: form.password })
    auth.setAuth(res.token, form.username.trim())
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (e: any) {
    const msg = e?.response?.data?.detail || e?.message || '登录失败'
    alert(msg)
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: min(420px, 100%);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.login-title {
  margin: 0 0 18px;
  font-size: 18px;
  color: var(--text-h);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  color: var(--muted);
}

.input {
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0 12px;
  outline: none;
  background: #fff;
}

.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.btn {
  margin-top: 8px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.tip {
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
}
</style>
