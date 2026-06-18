<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { addActivity, deleteActivity, editActivity, listActivities } from '@/api/activity'
import { searchProducts } from '@/api/product'
import ImageUploader from '@/components/ImageUploader.vue'
import { resolveMediaUrl } from '@/utils/media'
import type {
  ActivityListRequest,
  ActivityResponse,
  CreateActivityRequest,
  EditActivityRequest,
  ProductResponse,
} from '@/types/openapi'

const loading = ref(false)
const productLoading = ref(false)
const loadError = ref('')
const list = ref<ActivityResponse[]>([])
const products = ref<ProductResponse[]>([])
const dialogOpen = ref(false)
const editingId = ref<number | null>(null)
const productKeyword = ref('')

const filter = reactive({
  activity_name: '',
  status: '' as '' | '1' | '0' | 'ongoing' | 'upcoming' | 'ended',
})

const form = reactive({
  activity_name: '',
  banner: '',
  start_time: '',
  end_time: '',
  status: 1,
  product_ids: [] as number[],
  desc: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑活动' : '新增活动'))
const bannerList = computed<string[]>({
  get: () => (form.banner ? [form.banner] : []),
  set: (value) => {
    form.banner = value[0] ?? ''
  },
})

const filteredProducts = computed(() => {
  const keyword = productKeyword.value.trim().toLowerCase()
  if (!keyword) return products.value
  return products.value.filter((item) => item.product_name.toLowerCase().includes(keyword))
})

const totalProductsCount = computed(() =>
  list.value.reduce((sum, item) => sum + (item.product_ids?.length ?? 0), 0),
)

const stats = computed(() => {
  let ongoing = 0
  let upcoming = 0
  let ended = 0
  let disabled = 0

  for (const item of list.value) {
    const stage = getStage(item)
    if (stage === 'ongoing') ongoing += 1
    if (stage === 'upcoming') upcoming += 1
    if (stage === 'ended') ended += 1
    if (stage === 'disabled') disabled += 1
  }

  return { ongoing, upcoming, ended, disabled }
})

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return fallback
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

function toIsoString(value: string) {
  const date = new Date(value)
  return date.toISOString()
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getStage(row: ActivityResponse) {
  if (row.status !== 1) return 'disabled'

  const now = Date.now()
  const start = new Date(row.start_time).getTime()
  const end = new Date(row.end_time).getTime()

  if (!Number.isNaN(start) && now < start) return 'upcoming'
  if (!Number.isNaN(end) && now > end) return 'ended'
  return 'ongoing'
}

function getStageText(row: ActivityResponse) {
  const stage = getStage(row)
  if (stage === 'disabled') return '已下线'
  if (stage === 'upcoming') return '待开始'
  if (stage === 'ended') return '已结束'
  return '进行中'
}

function getStageClass(row: ActivityResponse) {
  const stage = getStage(row)
  if (stage === 'disabled') return 'status-pill status-pill--danger'
  if (stage === 'upcoming') return 'status-pill status-pill--warn'
  if (stage === 'ended') return 'status-pill'
  return 'status-pill status-pill--active'
}

function productCountLabel(row: ActivityResponse) {
  const count = row.product_ids?.length ?? 0
  return count > 0 ? `${count} 件商品` : '未配置'
}

function resetForm() {
  form.activity_name = ''
  form.banner = ''
  form.start_time = ''
  form.end_time = ''
  form.status = 1
  form.product_ids = []
  form.desc = ''
  productKeyword.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(row: ActivityResponse) {
  editingId.value = row.id
  form.activity_name = row.activity_name
  form.banner = row.banner
  form.start_time = toDateTimeLocal(row.start_time)
  form.end_time = toDateTimeLocal(row.end_time)
  form.status = row.status
  form.product_ids = [...(row.product_ids ?? [])]
  form.desc = row.desc ?? ''
  productKeyword.value = ''
  dialogOpen.value = true
}

function toggleProductSelection(productId: number) {
  if (form.product_ids.includes(productId)) {
    form.product_ids = form.product_ids.filter((item) => item !== productId)
    return
  }
  form.product_ids = [...form.product_ids, productId]
}

function resetFilters() {
  filter.activity_name = ''
  filter.status = ''
  refresh()
}

function showUploadError(message: string) {
  alert(message)
}

function buildListPayload(): ActivityListRequest {
  return {
    activity_name: filter.activity_name ? filter.activity_name.trim() : null,
    status: filter.status === '0' || filter.status === '1' ? Number(filter.status) : null,
  }
}

async function refresh() {
  loading.value = true
  loadError.value = ''
  try {
    const rows = await listActivities(buildListPayload())
    if (filter.status === 'ongoing') {
      list.value = rows.filter((item) => getStage(item) === 'ongoing')
      return
    }
    if (filter.status === 'upcoming') {
      list.value = rows.filter((item) => getStage(item) === 'upcoming')
      return
    }
    if (filter.status === 'ended') {
      list.value = rows.filter((item) => getStage(item) === 'ended')
      return
    }
    list.value = rows
  } catch (error) {
    list.value = []
    loadError.value = getErrorMessage(error, '活动列表加载失败，请确认后端已提供 /activity/list 接口')
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  productLoading.value = true
  try {
    products.value = await searchProducts({
      product_name: null,
      cate_id: null,
      status: 1,
      stock: null,
    })
  } catch {
    products.value = []
  } finally {
    productLoading.value = false
  }
}

async function submit() {
  if (!form.activity_name.trim()) {
    alert('请输入活动名称')
    return
  }
  if (!form.banner) {
    alert('请上传活动 Banner')
    return
  }
  if (!form.start_time || !form.end_time) {
    alert('请选择活动开始和结束时间')
    return
  }
  if (new Date(form.end_time).getTime() <= new Date(form.start_time).getTime()) {
    alert('结束时间必须晚于开始时间')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      const payload: EditActivityRequest = {
        id: editingId.value,
        activity_name: form.activity_name.trim(),
        banner: form.banner,
        start_time: toIsoString(form.start_time),
        end_time: toIsoString(form.end_time),
        status: form.status,
        product_ids: form.product_ids,
        desc: form.desc.trim(),
      }
      await editActivity(payload)
    } else {
      const payload: CreateActivityRequest = {
        activity_name: form.activity_name.trim(),
        banner: form.banner,
        start_time: toIsoString(form.start_time),
        end_time: toIsoString(form.end_time),
        status: form.status,
        product_ids: form.product_ids,
        desc: form.desc.trim(),
      }
      await addActivity(payload)
    }
    dialogOpen.value = false
    await refresh()
  } catch (error) {
    alert(getErrorMessage(error, '保存活动失败'))
  } finally {
    loading.value = false
  }
}

async function onDelete(row: ActivityResponse) {
  const ok = confirm(`确认删除活动「${row.activity_name}」？`)
  if (!ok) return

  loading.value = true
  try {
    await deleteActivity(row.id)
    await refresh()
  } catch (error) {
    alert(getErrorMessage(error, '删除活动失败'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProducts(), refresh()])
})
</script>

<template>
  <div class="admin-page">
    <section class="page-hero">
      <div class="page-hero__content">
        <h2 class="page-hero__title">活动管理</h2>
        <p class="page-hero__subtitle">
          统一维护活动 Banner、时间范围、参与商品和说明文案，便于小程序首页和活动专区直观展示。
        </p>
      </div>
      <div class="page-hero__actions">
        <button class="app-btn app-btn--secondary" type="button" :disabled="loading" @click="refresh">
          刷新列表
        </button>
        <button class="app-btn" type="button" @click="openCreate">新增活动</button>
      </div>
    </section>

    <section class="page-stats">
      <div class="stat-card">
        <span class="stat-card__label">活动总数</span>
        <div class="stat-card__value">{{ list.length }}</div>
        <div class="stat-card__meta">包含未开始、进行中、已结束与已下线活动</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">进行中</span>
        <div class="stat-card__value">{{ stats.ongoing }}</div>
        <div class="stat-card__meta">当前对小程序展示最关键的活动</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">待开始</span>
        <div class="stat-card__value">{{ stats.upcoming }}</div>
        <div class="stat-card__meta">可提前完成 Banner 和商品配置</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">关联商品数</span>
        <div class="stat-card__value">{{ totalProductsCount }}</div>
        <div class="stat-card__meta">所有活动累计已关联的商品数量</div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h3 class="panel__title">活动列表</h3>
          <p class="panel__desc">支持按活动名称、状态快速筛选</p>
        </div>
      </div>
      <div class="panel__body">
        <div class="filter-grid">
          <label class="field">
            <span class="field__label">活动名称</span>
            <input v-model.trim="filter.activity_name" class="app-input" placeholder="例如：周末满减活动" />
          </label>
          <label class="field">
            <span class="field__label">活动状态</span>
            <select v-model="filter.status" class="app-input">
              <option value="">全部状态</option>
              <option value="1">已启用</option>
              <option value="0">已下线</option>
              <option value="ongoing">进行中</option>
              <option value="upcoming">待开始</option>
              <option value="ended">已结束</option>
            </select>
          </label>
          <label class="field field--actions">
            <span class="field__label">操作</span>
            <div class="action-row">
              <button class="app-btn app-btn--secondary" type="button" :disabled="loading" @click="resetFilters">
                重置
              </button>
              <button class="app-btn" type="button" :disabled="loading" @click="refresh">查询</button>
            </div>
          </label>
        </div>

        <div v-if="loadError" class="load-error">
          {{ loadError }}
        </div>

        <div v-if="loading" class="loading-state">加载中...</div>

        <div v-else class="app-table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th style="width: 72px">ID</th>
                <th style="width: 280px">活动信息</th>
                <th style="width: 180px">Banner</th>
                <th style="width: 260px">活动时间</th>
                <th style="width: 120px">关联商品</th>
                <th style="width: 120px">状态</th>
                <th style="width: 160px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.id">
                <td>{{ row.id }}</td>
                <td>
                  <div class="row-title">{{ row.activity_name }}</div>
                  <div class="row-desc">{{ row.desc || '暂无活动说明' }}</div>
                </td>
                <td>
                  <div class="banner-thumb">
                    <img :src="resolveMediaUrl(row.banner)" :alt="row.activity_name" />
                  </div>
                </td>
                <td>
                  <div class="row-time">{{ formatDateTime(row.start_time) }}</div>
                  <div class="text-muted">至 {{ formatDateTime(row.end_time) }}</div>
                </td>
                <td>{{ productCountLabel(row) }}</td>
                <td>
                  <span :class="getStageClass(row)">{{ getStageText(row) }}</span>
                </td>
                <td>
                  <div class="table-ops">
                    <button class="app-link" type="button" @click="openEdit(row)">编辑</button>
                    <button class="app-link app-link--danger" type="button" @click="onDelete(row)">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="list.length === 0">
                <td colspan="7" class="empty-state">暂无活动数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="dialogOpen" class="app-dialog-mask" @click.self="dialogOpen = false">
      <div class="app-dialog" style="--dialog-width: 900px">
        <div class="app-dialog__header">{{ dialogTitle }}</div>
        <div class="app-dialog__body app-dialog__body--form">
          <div class="form-grid form-grid--2">
            <label class="field">
              <span class="field__label">活动名称</span>
              <input v-model.trim="form.activity_name" class="app-input" placeholder="例如：夏日冰啤专区" />
            </label>
            <label class="field">
              <span class="field__label">状态</span>
              <select v-model.number="form.status" class="app-input">
                <option :value="1">启用</option>
                <option :value="0">下线</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">开始时间</span>
              <input v-model="form.start_time" class="app-input" type="datetime-local" />
            </label>
            <label class="field">
              <span class="field__label">结束时间</span>
              <input v-model="form.end_time" class="app-input" type="datetime-local" />
            </label>
            <label class="field field--span-2">
              <span class="field__label">
                活动 Banner
                <span class="field__hint">建议上传宽图，用于首页或活动页头图展示</span>
              </span>
              <ImageUploader
                v-model="bannerList"
                module="activity"
                label="活动 Banner"
                :limit="1"
                @error="showUploadError"
              />
            </label>
            <label class="field field--span-2">
              <span class="field__label">活动说明</span>
              <textarea
                v-model.trim="form.desc"
                class="app-textarea"
                placeholder="可填写活动描述、优惠说明、展示文案"
              ></textarea>
            </label>
          </div>

          <section class="product-panel">
            <div class="product-panel__head">
              <div>
                <div class="panel__title product-title">关联商品</div>
                <p class="panel__desc">选择后将用于小程序活动页展示，可多选</p>
              </div>
              <div class="product-panel__tools">
                <input
                  v-model.trim="productKeyword"
                  class="app-input product-search"
                  placeholder="搜索商品名称"
                />
                <span class="product-count">已选 {{ form.product_ids.length }} 件</span>
              </div>
            </div>

            <div v-if="productLoading" class="loading-state">商品加载中...</div>

            <div v-else-if="filteredProducts.length > 0" class="product-grid">
              <button
                v-for="item in filteredProducts"
                :key="item.id"
                class="chip product-chip"
                :class="{ 'is-active': form.product_ids.includes(item.id) }"
                type="button"
                @click="toggleProductSelection(item.id)"
              >
                <span>{{ item.product_name }}</span>
                <span class="text-muted">ID {{ item.id }}</span>
              </button>
            </div>

            <div v-else class="empty-state">没有匹配到商品，请先在商品管理中创建并上架商品</div>
          </section>
        </div>
        <div class="app-dialog__footer">
          <button class="app-btn app-btn--secondary" type="button" @click="dialogOpen = false">取消</button>
          <button class="app-btn" type="button" :disabled="loading" @click="submit">保存活动</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field--actions {
  justify-content: flex-end;
}

.action-row {
  display: flex;
  gap: 10px;
}

.load-error {
  margin: 18px 0 6px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(220, 38, 38, 0.16);
  background: rgba(220, 38, 38, 0.06);
  color: var(--danger);
  line-height: 1.6;
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

.row-time {
  font-weight: 600;
  color: var(--text-h);
  margin-bottom: 4px;
}

.banner-thumb {
  width: 138px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.banner-thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.product-panel {
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.9), #fff);
}

.product-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.product-title {
  font-size: 16px;
}

.product-panel__tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-search {
  width: 240px;
}

.product-count {
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.product-chip {
  justify-content: space-between;
  min-height: 46px;
}

@media (max-width: 640px) {
  .action-row,
  .product-panel__head,
  .product-panel__tools {
    flex-direction: column;
    align-items: stretch;
  }

  .product-search {
    width: 100%;
  }

  .banner-thumb {
    width: 100%;
    max-width: 150px;
  }
}
</style>
