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
  <div class="page">
    <div class="page-head">
      <div class="title">分类管理</div>
      <div class="actions">
        <button class="btn" type="button" @click="openCreate">新增分类</button>
        <button class="btn secondary" type="button" :disabled="loading" @click="saveSort">
          保存排序
        </button>
      </div>
    </div>

    <div class="card">
      <div class="filters">
        <input v-model.trim="filter.cate_name" class="input" placeholder="分类名称" />
        <select v-model="filter.status" class="input">
          <option value="">全部状态</option>
          <option value="1">启用</option>
          <option value="0">禁用</option>
        </select>
        <button class="btn secondary" type="button" :disabled="loading" @click="refresh">
          查询
        </button>
      </div>

      <div v-if="loading" class="loading">加载中…</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th style="width: 80px">ID</th>
            <th>分类名称</th>
            <th style="width: 160px">排序</th>
            <th style="width: 120px">状态</th>
            <th style="width: 200px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.cate_name }}</td>
            <td>
              <input v-model.number="row.sort" class="input small" type="number" />
            </td>
            <td>
              <span :class="row.status === 1 ? 'tag ok' : 'tag'">{{
                row.status === 1 ? '启用' : '禁用'
              }}</span>
            </td>
            <td class="ops">
              <button class="link" type="button" @click="openEdit(row)">编辑</button>
              <button class="link danger" type="button" @click="onDelete(row)">删除</button>
            </td>
          </tr>
          <tr v-if="list.length === 0">
            <td colspan="5" class="empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="dialogOpen" class="dialog-mask" @click.self="dialogOpen = false">
      <div class="dialog">
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="dialog-body">
          <label class="field">
            <span class="label">分类名称</span>
            <input v-model.trim="form.cate_name" class="input" placeholder="例如：啤酒" />
          </label>
          <label class="field">
            <span class="label">排序</span>
            <input v-model.number="form.sort" class="input" type="number" />
          </label>
          <label class="field">
            <span class="label">状态</span>
            <select v-model.number="form.status" class="input">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
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

.input.small {
  height: 32px;
  width: 120px;
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
  width: min(520px, 100%);
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
</style>
