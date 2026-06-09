import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_KEY = 'token'
const USERNAME_KEY = 'username'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const username = ref<string>(localStorage.getItem(USERNAME_KEY) || '管理员')

  const isAuthed = computed(() => Boolean(token.value))

  function setAuth(nextToken: string, nextUsername?: string) {
    token.value = nextToken
    localStorage.setItem(TOKEN_KEY, nextToken)
    if (nextUsername) {
      username.value = nextUsername
      localStorage.setItem(USERNAME_KEY, nextUsername)
    }
  }

  function logout() {
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, username, isAuthed, setAuth, logout }
})
