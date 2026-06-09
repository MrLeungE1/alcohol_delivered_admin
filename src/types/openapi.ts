export interface CreateProductRequest {
  cate_id: number
  product_name: string
  price: number
  market_price?: number | null
  thumb?: string | null
  detail_img?: string | null
  stock?: number
  is_hot?: number
  is_special?: number
  desc?: string | null
  status?: number
}

export interface EditProductRequest {
  id: number
  cate_id?: number | null
  product_name?: string | null
  price?: number | null
  market_price?: number | null
  thumb?: string | null
  detail_img?: string | null
  stock?: number | null
  is_hot?: number | null
  is_special?: number | null
  desc?: string | null
  status?: number | null
}

export interface SearchProductRequest {
  product_name?: string | null
  cate_id?: number | null
  status?: number | null
  stock?: number | null
}

export interface ProductResponse {
  id: number
  cate_id: number
  product_name: string
  price: number
  market_price?: number | null
  thumb?: string | null
  detail_img?: string | null
  stock: number
  is_hot: number
  is_special: number
  desc?: string | null
  status: number
}

export interface CreateCategoryRequest {
  cate_name: string
  sort?: number
  status?: number
}

export interface UpdateCategoryRequest {
  id: number
  cate_name: string
  sort?: number
  status?: number
}

export interface CategoryListRequest {
  cate_name?: string | null
  sort?: number | null
  status?: number | null
}

export interface CategoryResponse {
  id: number
  cate_name: string
  sort: number
  status: number
}

export interface SortCategory {
  sort: number
  id: number
}

export interface SortCategoryRequest {
  list: SortCategory[]
}

export interface SysAdminCreate {
  username: string
  password: string
  name?: string
  status?: number
}

export interface SysAdminUpdate {
  id: number
  username?: string
  password?: string
  name?: string
  status?: number
}

export interface SysAdminLogin {
  username: string
  password: string
}

export interface SysAdminLoginResponse {
  token: string
}
