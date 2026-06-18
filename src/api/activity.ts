import { del, post, put, get } from './http'
import type {
  ActivityListRequest,
  ActivityResponse,
  CreateActivityRequest,
  EditActivityRequest,
} from '@/types/openapi'

export function listActivities(body: ActivityListRequest = {}) {
  return get<ActivityResponse[]>('/activity/list', { params: body })
}

export function addActivity(body: CreateActivityRequest) {
  return post<void, CreateActivityRequest>('/activity/create', body)
}

export function editActivity(body: EditActivityRequest) {
  return put<void, EditActivityRequest>('/activity/edit', body)
}

export function deleteActivity(activityId: number) {
  return del<void>(`/activity/${activityId}`)
}
