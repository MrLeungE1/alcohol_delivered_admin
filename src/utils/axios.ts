import axios from 'axios'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function unwrapPayload(value: unknown): unknown {
  if (!isRecord(value)) {
    return value
  }

  const wrapperKeys = ['data', 'result', 'payload'] as const
  const hasMetaKeys = ['code', 'status', 'msg', 'message', 'success'].some((key) => key in value)

  for (const key of wrapperKeys) {
    if (key in value && (hasMetaKeys || Object.keys(value).length === 1)) {
      return value[key]
    }
  }

  return value
}

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    return unwrapPayload(response.data) as any
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default service
