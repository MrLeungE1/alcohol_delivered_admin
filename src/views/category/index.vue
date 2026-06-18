<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/openapi'
import { addCategory, deleteCategory, editCategory, listCategories, sortCategory } from '@/api/category'

const loading = ref(false)
const list = ref<CategoryResponse[]>([])

const filter = reactive({
  cate_name: '',
  status: '' as '' | '0' | '1',
})

const dialogOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  cate_name: '',
  sort: 0,
  status: 1,
})

const dialogTitle = computed(() => (editingId.value ? '编辑分类' : '新增分类'))
const stats = computed(() => ({
  total: list.value.length,
  active: list.value.filter((item) => item.status === 1).length,
  disabled: list.value.filter((item) => item.status === 0).length,
  maxSort: list.value.length ? Math.max(...list.value.map((item) => item.sort)) : 0,
}))

async function refresh() {
  loading.value = true
  try {
    list.value = await listCategories({
      cate_name: filter.cate_name ? filter.cate_name : null,
      status: filter.status === '' ? null : Number(filter.status),
      sort: null,
    })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.cate_name = ''
  form.sort = 0
  form.status = 1
  dialogOpen.value = true
}

function openEdit(row: CategoryResponse) {
  editingId.value = row.id
  form.cate_name = row.cate_name
  form.sort = row.sort
  form.status = row.status
  dialogOpen.value = true
}

function resetFilters() {
  filter.cate_name = ''
  filter.status = ''
  refresh()
}

async function submit() {
  if (!form.cate_name.trim()) {
    alert('请输入分类名称')
    return
  }

  loading.value = true
  try {
    if (editingId.value) {
      const payload: UpdateCategoryRequest = {
        id: editingId.value,
        cate_name: form.cate_name.trim(),
        sort: Number(form.sort) || 0,
        status: Number(form.status) || 0,
      }
      await editCategory(payload)
    } else {
      const payload: CreateCategoryRequest = {
        cate_name: form.cate_name.trim(),
        sort: Number(form.sort) || 0,
        status: Number(form.status) || 0,
      }
      await addCategory(payload)
    }
    dialogOpen.value = false
    await refresh()
  } finally {
    loading.value = false
  }
}

async function onDelete(row: CategoryResponse) {
  const ok = confirm(`确认删除分类「${row.cate_name}」？`)
  if (!ok) return
  loading.value = true
  try {
    await deleteCategory(row.id)
    await refresh()
  } finally {
    loading.value = false
  }
}

async function saveSort() {
  loading.value = true
  try {
    await sortCategory({
      list: list.value.map((item) => ({ id: item.id, sort: Number(item.sort) || 0 })),
    })
    alert('排序已保存')
    await refresh()
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<template>
  <div class="admin-page">
    <section class="page-hero">
      <div class="page-hero__content">
        <h2 class="page-hero__title">分类管理</h2>
        <p class="page-hero__subtitle">
          管理商品类目、状态和排序，排序值越小越靠前，便于小程序端更自然地组织商品结构。
        </p>
      </div>
      <div class="page-hero__actions">
        <button class="app-btn app-btn--secondary" type="button" :disabled="loading" @click="saveSort">
          保存排序
        </button>
        <button class="app-btn" type="button" @click="openCreate">新增分类</button>
      </div>
    </section>

    <section class="page-stats">
      <div class="stat-card">
        <span class="stat-card__label">分类总数</span>
        <div class="stat-card__value">{{ stats.total }}</div>
        <div class="stat-card__meta">当前查询结果中的分类数量</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">启用分类</span>
        <div class="stat-card__value">{{ stats.active }}</div>
        <div class="stat-card__meta">在前台正常可用的分类</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">禁用分类</span>
        <div class="stat-card__value">{{ stats.disabled }}</div>
        <div class="stat-card__meta">暂不展示的分类</div>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">最大排序值</span>
        <div class="stat-card__value">{{ stats.maxSort }}</div>
        <div class="stat-card__meta">可作为新增分类排序参考</div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h3 class="panel__title">分类列表</h3>
          <p class="panel__desc">支持筛选、编辑与批量调整排序</p>
        </div>
      </div>
      <div class="panel__body">
        <div class="filter-grid">
          <label class="field">
            <span class="field__label">分类名称</span>
            <input v-model.trim="filter.cate_name" class="app-input" placeholder="输入分类名称" />
          </label>
          <label class="field">
            <span class="field__label">状态</span>
            <select v-model="filter.status" class="app-input">
              <option value="">全部状态</option>
              <option value="1">启用</option>
              <option value="0">禁用</option>
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
                <th>分类名称</th>
                <th style="width: 180px">排序</th>
                <th style="width: 120px">状态</th>
                <th style="width: 160px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.id">
                <td>{{ row.id }}</td>
                <td class="text-strong">{{ row.cate_name }}</td>
                <td>
                  <input v-model.number="row.sort" class="app-input sort-input" type="number" />
                </td>
                <td>
                  <span :class="row.status === 1 ? 'status-pill status-pill--active' : 'status-pill'">
                    {{ row.status === 1 ? '启用' : '禁用' }}
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
                <td colspan="5" class="empty-state">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="dialogOpen" class="app-dialog-mask" @click.self="dialogOpen = false">
      <div class="app-dialog" style="--dialog-width: 520px">
        <div class="app-dialog__header">{{ dialogTitle }}</div>
        <div class="app-dialog__body app-dialog__body--form">
          <label class="field">
            <span class="field__label">分类名称</span>
            <input v-model.trim="form.cate_name" class="app-input" placeholder="例如：啤酒" />
          </label>
          <label class="field">
            <span class="field__label">排序</span>
            <input v-model.number="form.sort" class="app-input" type="number" />
          </label>
          <label class="field">
            <span class="field__label">状态</span>
            <select v-model.number="form.status" class="app-input">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
          </label>
        </div>
        <div class="app-dialog__footer">
          <button class="app-btn app-btn--secondary" type="button" @click="dialogOpen = false">取消</button>
          <button class="app-btn" type="button" :disabled="loading" @click="submit">保存分类</button>
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

.sort-input {
  width: 120px;
}

@media (max-width: 640px) {
  .filter-actions {
    flex-direction: column;
  }
}
</style>
