import { get, post } from './http'
import type { SysAdminCreate, SysAdminMeResponse, SysAdminUpdate } from '@/types/openapi'

export function createSysAdmin(body: SysAdminCreate) {
  return post<SysAdminCreate, SysAdminCreate>('/admin/sys_admin/create', body)
}

export function updateSysAdmin(body: SysAdminUpdate) {
  return post<SysAdminCreate, SysAdminUpdate>('/admin/sys_admin/update', body)
}

export function getCurrentSysAdmin() {
  return get<SysAdminMeResponse>('/admin/sys_admin/me')
}
