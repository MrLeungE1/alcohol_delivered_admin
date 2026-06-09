import { post } from './http'
import type { SysAdminLogin, SysAdminLoginResponse } from '@/types/openapi'

export function login(body: SysAdminLogin) {
  return post<SysAdminLoginResponse, SysAdminLogin>('/admin/sys_admin/login', body)
}
