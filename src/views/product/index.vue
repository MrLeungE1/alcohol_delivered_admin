<template>
  <div class="page">
    <div class="page-head">
      <div class="title">商品管理</div>
      <div class="actions">
        <button class="btn" type="button" @click="openCreate">新增商品</button>
      </div>
    </div>

    <div class="card">
      <div class="filters">
        <input v-model.trim="filter.product_name" class="input" placeholder="商品名称" />
        <select v-model="filter.cate_id" class="input">
          <option value="">全部分类</option>
          <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.cate_name }}</option>
        </select>
        <select v-model="filter.status" class="input">
          <option value="">全部状态</option>
          <option value="1">上架</option>
          <option value="0">下架</option>
        </select>
        <button class="btn secondary" type="button" :disabled="loading" @click="refresh">查询</button>
      </div>

      <div v-if="loading" class="loading">加载中…</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th style="width: 80px">ID</th>
            <th>商品名称</th>
            <th style="width: 160px">分类</th>
            <th style="width: 120px">售价</th>
            <th style="width: 120px">库存</th>
            <th style="width: 120px">状态</th>
            <th style="width: 220px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.product_name }}</td>
            <td>{{ cateNameMap[row.cate_id] || row.cate_id }}</td>
            <td>{{ row.price }}</td>
            <td>{{ row.stock }}</td>
            <td>
              <span :class="row.status === 1 ? 'tag ok' : 'tag'">{{
                row.status === 1 ? '上架' : '下架'
              }}</span>
            </td>
            <td class="ops">
              <button class="link" type="button" @click="openEdit(row)">编辑</button>
              <button class="link danger" type="button" @click="onDelete(row)">删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0">
            <td colspan="7" class="empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="dialogOpen" class="dialog-mask" @click.self="dialogOpen = false">
      <div class="dialog">
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="dialog-body">
          <label class="field">
            <span class="label">分类</span>
            <select v-model.number="form.cate_id" class="input">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.cate_name }}</option>
            </select>
          </label>
          <label class="field">
            <span class="label">商品名称</span>
            <input v-model.trim="form.product_name" class="input" placeholder="例如：青岛啤酒 330ml" />
          </label>
          <div class="grid">
            <label class="field">
              <span class="label">售价</span>
              <input v-model.number="form.price" class="input" type="number" step="0.01" min="0" />
            </label>
            <label class="field">
              <span class="label">原价</span>
              <input
                v-model.number="form.market_price"
                class="input"
                type="number"
                step="0.01"
                min="0"
              />
            </label>
          </div>
          <div class="grid">
            <label class="field">
              <span class="label">库存</span>
              <input v-model.number="form.stock" class="input" type="number" min="0" />
            </label>
            <label class="field">
              <span class="label">状态</span>
              <select v-model.number="form.status" class="input">
                <option :value="1">上架</option>
                <option :value="0">下架</option>
              </select>
            </label>
          </div>
          <div class="grid">
            <label class="field">
              <span class="label">热销</span>
              <select v-model.number="form.is_hot" class="input">
                <option :value="0">否</option>
                <option :value="1">是</option>
              </select>
            </label>
            <label class="field">
              <span class="label">特价</span>
              <select v-model.number="form.is_special" class="input">
                <option :value="0">否</option>
                <option :value="1">是</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span class="label">缩略图</span>
            <input v-model.trim="form.thumb" class="input" placeholder="图片 URL（可选）" />
          </label>
          <label class="field">
            <span class="label">描述</span>
            <textarea v-model.trim="form.desc" class="textarea" placeholder="可选"></textarea>
          </label>
        </div>
        <div class="dialog-foot">
          <button class="btn secondary" type="button" @click="dialogOpen = false">取消</button>
          <button class="btn" type="button" :disabled="loading" @click="submit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { addProduct, deleteProduct, editProduct, searchProducts } from '@/api/product'
import { listCategories } from '@/api/category'
import type {
  CategoryResponse,
  CreateProductRequest,
  EditProductRequest,
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
  desc: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑商品' : '新增商品'))

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
  form.desc = ''
  if (categories.value.length > 0) form.cate_id = categories.value[0].id
  dialogOpen.value = true
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
  form.desc = row.desc ?? ''
  dialogOpen.value = true
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
    if (editingId.value) {
      const payload: EditProductRequest = {
        id: editingId.value,
        cate_id: form.cate_id,
        product_name: form.product_name.trim(),
        price: Number(form.price),
        market_price: form.market_price ? Number(form.market_price) : null,
        thumb: form.thumb ? form.thumb : null,
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
<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
}

.actions {
  display: flex;
  gap: 10px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
}

.input {
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0 12px;
  outline: none;
  background: #fff;
}

.textarea {
  min-height: 90px;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 8px 12px;
  outline: none;
  resize: vertical;
  background: #fff;
}

.btn {
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
}

.btn.secondary {
  background: #fff;
  color: var(--text);
  border-color: var(--border);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 14px;
}

.ops {
  display: flex;
  gap: 10px;
}

.link {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
}

.link.danger {
  color: var(--danger);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(100, 116, 139, 0.14);
  color: var(--text);
}

.tag.ok {
  background: var(--accent-bg);
  color: var(--accent);
}

.empty {
  text-align: center;
  color: var(--muted);
  padding: 20px 0;
}

.loading {
  padding: 18px 0;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dialog {
  width: min(720px, 100%);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18);
}

.dialog-title {
  padding: 14px 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}

.dialog-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  color: var(--muted);
}

.dialog-foot {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
