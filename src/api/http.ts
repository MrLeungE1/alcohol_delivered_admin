import service from '@/utils/axios'

export async function get<T>(url: string, params?: Record<string, unknown>) {
  const res = await service.get(url, { params })
  return res as T
}

export async function post<T, B = unknown>(url: string, body?: B) {
  const res = await service.post(url, body)
  return res as T
}

export async function put<T, B = unknown>(url: string, body?: B) {
  const res = await service.put(url, body)
  return res as T
}

export async function del<T>(url: string) {
  const res = await service.delete(url)
  return res as T
}
