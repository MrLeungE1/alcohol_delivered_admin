import { post } from './http'
import type { SysAdminCreate, SysAdminUpdate } from '@/types/openapi'

export function createSysAdmin(body: SysAdminCreate) {
  return post<SysAdminCreate, SysAdminCreate>('/admin/sys_admin/create', body)
}

export function updateSysAdmin(body: SysAdminUpdate) {
  return post<SysAdminCreate, SysAdminUpdate>('/admin/sys_admin/update', body)
}
