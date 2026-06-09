import { del, post, put } from './http'
import type {
  CategoryListRequest,
  CategoryResponse,
  CreateCategoryRequest,
  SortCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/openapi'

export function addCategory(body: CreateCategoryRequest) {
  return post<CategoryResponse, CreateCategoryRequest>('/category/add', body)
}

export function editCategory(body: UpdateCategoryRequest) {
  return put<CategoryResponse, UpdateCategoryRequest>('/category/edit', body)
}

export function listCategories(body: CategoryListRequest = {}) {
  return post<CategoryResponse[], CategoryListRequest>('/category/list', body)
}

export function deleteCategory(id: number) {
  return del<void>(`/category/${id}`)
}

export function sortCategory(body: SortCategoryRequest) {
  return post<void, SortCategoryRequest>('/category/sort', body)
}
