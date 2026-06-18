<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { addProduct, deleteProduct, editProduct, searchProducts } from '@/api/product'
import { listCategories } from '@/api/category'
import ImageUploader from '@/components/ImageUploader.vue'
import { resolveMediaUrl } from '@/utils/media'
import type {
  CategoryResponse,
  CreateProductRequest,
  EditProductRequest,
  ProductImageItem,
  ProductResponse,
} from '@/types/openapi'

const loading = ref(false)
const list = ref<ProductResponse[]>([])
const categories = ref<CategoryResponse[]>([])

const filter = reactive({
  product_name: '',
  cate_id: '' as '' | string,
  status: '' as '' | '0' | '1',
})

const cateNameMap = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {}
  for (const c of categories.value) map[c.id] = c.cate_name
  return map
})

const dialogOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  cate_id: 0,
  product_name: '',
  price: 0,
  market_price: 0,
  stock: 0,
  status: 1,
  is_hot: 0,
  is_special: 0,
  thumb: '',
  banner_images: [] as string[],
  detail_images: [] as string[],
  desc: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑商品' : '新增商品'))
const thumbList = computed<string[]>({
  get: () => (form.thumb ? [form.thumb] : []),
  set: (value) => {
    form.thumb = value[0] ?? ''
  },
})
const stats = computed(() => ({
  total: list.value.length,
  online: list.value.filter((item) => item.status === 1).length,
  hot: list.value.filter((item) => item.is_hot === 1).length,
  stock: list.value.reduce((sum, item) => sum + item.stock, 0),
}))

async function loadCategories() {
  categories.value = await listCategories({})
  if (categories.value.length > 0 && form.cate_id === 0) {
    form.cate_id = categories.value[0].id
  }
}

async function refresh() {
  loading.value = true
  try {
    list.value = await searchProducts({
      product_name: filter.product_name ? filter.product_name : null,
      cate_id: filter.cate_id === '' ? null : Number(filter.cate_id),
      status: filter.status === '' ? null : Number(filter.status),
      stock: null,
    })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.product_name = ''
  form.price = 0
  form.market_price = 0
  form.stock = 0
  form.status = 1
  form.is_hot = 0
  form.is_special = 0
  form.thumb = ''
  form.banner_images = []
  form.detail_images = []
  form.desc = ''
  if (categories.value.length > 0) form.cate_id = categories.value[0].id
  dialogOpen.value = true
}

function resetFilters() {
  filter.product_name = ''
  filter.cate_id = ''
  filter.status = ''
  refresh()
}

function pickProductImages(row: ProductResponse, imageType: number) {
  return (row.images ?? [])
    .filter((item) => item.image_type === imageType)
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.image_url)
}

function openEdit(row: ProductResponse) {
  editingId.value = row.id
  form.cate_id = row.cate_id
  form.product_name = row.product_name
  form.price = row.price
  form.market_price = row.market_price ?? 0
  form.stock = row.stock
  form.status = row.status
  form.is_hot = row.is_hot
  form.is_special = row.is_special
  form.thumb = row.thumb ?? ''
  form.banner_images = pickProductImages(row, 1)
  form.detail_images = pickProductImages(row, 2)
  form.desc = row.desc ?? ''
  dialogOpen.value = true
}

function buildProductImages(urls: string[], imageType: number): ProductImageItem[] {
  return urls
    .map((item) => item.trim())
    .filter(Boolean)
    .map((image_url, index) => ({
      image_url,
      image_type: imageType,
      sort: index,
    }))
}

function getImageSummary(row: ProductResponse) {
  const images = row.images ?? []
  const bannerCount = images.filter((item) => item.image_type === 1).length
  const detailCount = images.filter((item) => item.image_type === 2).length
  return `轮播 ${bannerCount} / 详情 ${detailCount}`
}

function showUploadError(message: string) {
  alert(message)
}

async function submit() {
  if (!form.cate_id) {
    alert('请选择分类')
    return
  }
  if (!form.product_name.trim()) {
    alert('请输入商品名称')
    return
  }
  if (Number(form.price) <= 0) {
    alert('请输入正确的售价')
    return
  }

  loading.value = true
  try {
    const images = [
      ...buildProductImages(form.banner_images, 1),
      ...buildProductImages(form.detail_images, 2),
    ]

    if (editingId.value) {
      const payload: EditProductRequest = {
        id: editingId.value,
        cate_id: form.cate_id,
        product_name: form.product_name.trim(),
        price: Number(form.price),
        market_price: form.market_price ? Number(form.market_price) : null,
        thumb: form.thumb ? form.thumb : null,
        images: images.length > 0 ? images : null,
        stock: Number(form.stock) || 0,
        status: Number(form.status) || 0,
        is_hot: Number(form.is_hot) || 0,
        is_special: Number(form.is_special) || 0,
        desc: form.desc ? form.desc : null,
      }
      await editProduct(payload)
    } else {
      const payload: CreateProductRequest = {
        cate_id: form.cate_id,
        product_name: form.product_name.trim(),
        price: Number(form.price),
        market_price: form.market_price ? Number(form.market_price) : null,
        thumb: form.thumb ? form.thumb : null,
        images: images.length > 0 ? images : null,
        stock: Number(form.stock) || 0,
        status: Number(form.status) || 0,
        is_hot: Number(form.is_hot) || 0,
        is_special: Number(form.is_special) || 0,
        desc: form.desc ? form.desc : null,
      }
      await addProduct(payload)
    }
    dialogOpen.value = false
    await refresh()
  } finally {
    loading.value = false
  }
}

async function onDelete(row: ProductResponse) {
  const ok = confirm(`确认删除商品「${row.product_name}」？`)
  if (!ok) return
  loading.value = true
  try {
    await deleteProduct(row.id)
    await refresh()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await refresh()
})
</script>
<template>
  <div class="admin-page">
    <section class="page-hero">
      <div class="page-hero__content">
        <h2 class="page-hero__title">商品管理</h2>
        <p class="page-hero__subtitle">
          统一维护商品基础信息、价格、库存和图片素材，当前上传区已适配更直观的展示方式。
        </p>
      </div>
      <div class="page-hero__actions">
        <button class="app-btn app-btn--secondary" type="button" :disabled="loading" @click="refresh">
          刷新列表
        </button>
        <button class="app-btn" type="button" @click="openCreate">新增商品</button>
      </div>
    </section>

    <section class="page-stats">
      <div class="stat-card">
        <span class="stat-card__label">商品总数</span>
        <div class="stat-card__value">{{ stats.total }}</div>
        <div class="stat-card__meta">当前查询结果中的商品数量</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">上架商品</span>
        <div class="stat-card__value">{{ stats.online }}</div>
        <div class="stat-card__meta">对小程序前台可见的商品</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">热销商品</span>
        <div class="stat-card__value">{{ stats.hot }}</div>
        <div class="stat-card__meta">被标记为热销的商品数</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">总库存</span>
        <div class="stat-card__value">{{ stats.stock }}</div>
        <div class="stat-card__meta">当前查询结果累计库存</div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h3 class="panel__title">商品列表</h3>
          <p class="panel__desc">按名称、分类、状态筛选并维护商品信息</p>
        </div>
      </div>
      <div class="panel__body">
        <div class="filter-grid">
          <label class="field">
            <span class="field__label">商品名称</span>
            <input v-model.trim="filter.product_name" class="app-input" placeholder="输入商品名称" />
          </label>
          <label class="field">
            <span class="field__label">商品分类</span>
            <select v-model="filter.cate_id" class="app-input">
              <option value="">全部分类</option>
              <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.cate_name }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">商品状态</span>
            <select v-model="filter.status" class="app-input">
              <option value="">全部状态</option>
              <option value="1">上架</option>
              <option value="0">下架</option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">操作</span>
            <div class="filter-actions">
              <button class="app-btn app-btn--secondary" type="button" :disabled="loading" @click="resetFilters">
                重置
              </button>
              <button class="app-btn" type="button" :disabled="loading" @click="refresh">查询</button>
            </div>
          </label>
        </div>

        <div v-if="loading" class="loading-state">加载中...</div>

        <div v-else class="app-table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th style="width: 80px">ID</th>
                <th style="width: 280px">商品信息</th>
                <th style="width: 140px">分类</th>
                <th style="width: 170px">图片</th>
                <th style="width: 120px">售价</th>
                <th style="width: 120px">库存</th>
                <th style="width: 120px">状态</th>
                <th style="width: 160px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.id">
                <td>{{ row.id }}</td>
                <td>
                  <div class="row-title">{{ row.product_name }}</div>
                  <div class="row-desc">
                    <span>{{ row.is_hot === 1 ? '热销' : '普通' }}</span>
                    <span> / </span>
                    <span>{{ row.is_special === 1 ? '特价' : '常规价' }}</span>
                    <span v-if="row.desc"> / {{ row.desc }}</span>
                  </div>
                </td>
                <td>{{ cateNameMap[row.cate_id] || row.cate_id }}</td>
                <td>
                  <div class="thumb-cell">
                    <img
                      v-if="row.thumb"
                      :src="resolveMediaUrl(row.thumb)"
                      :alt="row.product_name"
                    />
                    <span class="text-muted">{{ getImageSummary(row) }}</span>
                  </div>
                </td>
                <td class="text-strong">￥{{ row.price }}</td>
                <td>{{ row.stock }}</td>
                <td>
                  <span :class="row.status === 1 ? 'status-pill status-pill--active' : 'status-pill'">
                    {{ row.status === 1 ? '上架' : '下架' }}
                  </span>
                </td>
                <td>
                  <div class="table-ops">
                    <button class="app-link" type="button" @click="openEdit(row)">编辑</button>
                    <button class="app-link app-link--danger" type="button" @click="onDelete(row)">删除</button>
                  </div>
                </td>
              </tr>
              <tr v-if="list.length === 0">
                <td colspan="8" class="empty-state">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="dialogOpen" class="app-dialog-mask" @click.self="dialogOpen = false">
      <div class="app-dialog" style="--dialog-width: 820px">
        <div class="app-dialog__header">{{ dialogTitle }}</div>
        <div class="app-dialog__body app-dialog__body--form">
          <div class="form-grid form-grid--2">
            <label class="field">
              <span class="field__label">分类</span>
              <select v-model.number="form.cate_id" class="app-input">
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.cate_name }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">商品名称</span>
              <input v-model.trim="form.product_name" class="app-input" placeholder="例如：青岛啤酒 330ml" />
            </label>
            <label class="field">
              <span class="field__label">售价</span>
              <input v-model.number="form.price" class="app-input" type="number" step="0.01" min="0" />
            </label>
            <label class="field">
              <span class="field__label">原价</span>
              <input
                v-model.number="form.market_price"
                class="app-input"
                type="number"
                step="0.01"
                min="0"
              />
            </label>
            <label class="field">
              <span class="field__label">库存</span>
              <input v-model.number="form.stock" class="app-input" type="number" min="0" />
            </label>
            <label class="field">
              <span class="field__label">状态</span>
              <select v-model.number="form.status" class="app-input">
                <option :value="1">上架</option>
                <option :value="0">下架</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">热销</span>
              <select v-model.number="form.is_hot" class="app-input">
                <option :value="0">否</option>
                <option :value="1">是</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">特价</span>
              <select v-model.number="form.is_special" class="app-input">
                <option :value="0">否</option>
                <option :value="1">是</option>
              </select>
            </label>
            <label class="field field--span-2">
              <span class="field__label">
                缩略图
                <span class="field__hint">用于列表卡片和核心展示区域</span>
              </span>
              <ImageUploader v-model="thumbList" label="缩略图" :limit="1" @error="showUploadError" />
            </label>
            <label class="field field--span-2">
              <span class="field__label">
                轮播图
                <span class="field__hint">建议上传多张，突出商品卖点</span>
              </span>
              <ImageUploader
                v-model="form.banner_images"
                label="轮播图"
                :limit="6"
                multiple
                @error="showUploadError"
              />
            </label>
            <label class="field field--span-2">
              <span class="field__label">
                详情图
                <span class="field__hint">详情页可展示规格、包装和卖点</span>
              </span>
              <ImageUploader
                v-model="form.detail_images"
                label="详情图"
                :limit="12"
                multiple
                @error="showUploadError"
              />
            </label>
            <label class="field field--span-2">
              <span class="field__label">描述</span>
              <textarea v-model.trim="form.desc" class="app-textarea" placeholder="可选"></textarea>
            </label>
          </div>
        </div>
        <div class="app-dialog__footer">
          <button class="app-btn app-btn--secondary" type="button" @click="dialogOpen = false">取消</button>
          <button class="app-btn" type="button" :disabled="loading" @click="submit">保存商品</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-actions {
  display: flex;
  gap: 10px;
}

.row-title {
  font-weight: 700;
  color: var(--text-h);
}

.row-desc {
  margin-top: 6px;
  color: var(--muted);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .filter-actions {
    flex-direction: column;
  }
}
</style>
