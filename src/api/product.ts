import { del, get, post, put } from './http'
import type {
  CreateProductRequest,
  EditProductRequest,
  ProductResponse,
  SearchProductRequest,
} from '@/types/openapi'

export function addProduct(body: CreateProductRequest) {
  return post<ProductResponse, CreateProductRequest>('/admin/product/add', body)
}

export function searchProducts(body: SearchProductRequest) {
  return post<ProductResponse[], SearchProductRequest>('/admin/product/search', body)
}

export function editProduct(body: EditProductRequest) {
  return put<ProductResponse, EditProductRequest>('/admin/product/edit', body)
}

export function deleteProduct(productId: number) {
  return del<void>(`/admin/product/${productId}`)
}

export function getProductDetail(productId: number) {
  return get<unknown>(`/admin/product/product/${productId}`)
}
