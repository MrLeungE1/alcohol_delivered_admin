<template>
  <div class="uploader">
    <div class="toolbar">
      <button
        class="upload-btn"
        type="button"
        :disabled="disabled || uploading || cannotSelect"
        @click="openFileDialog"
      >
        {{ buttonText }}
      </button>
      <span class="meta">{{ helperText }}</span>
    </div>

    <input
      ref="inputRef"
      class="native-input"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled || uploading || cannotSelect"
      @change="handleFileChange"
    />

    <div v-if="items.length > 0" class="list">
      <div v-for="(url, index) in items" :key="`${url}-${index}`" class="card">
        <img class="preview" :src="resolveMediaUrl(url)" :alt="`${label}-${index + 1}`" />
        <div class="card-bar">
          <span class="index">#{{ index + 1 }}</span>
          <button class="link danger" type="button" :disabled="disabled || uploading" @click="removeAt(index)">
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="items.length === 0" class="empty">
      暂无图片
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { uploadImage, type UploadModule } from '@/api/upload'
import { resolveMediaUrl } from '@/utils/media'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    module?: UploadModule
    limit?: number
    multiple?: boolean
    disabled?: boolean
    accept?: string
    label?: string
  }>(),
  {
    module: 'product',
    limit: 1,
    multiple: false,
    disabled: false,
    accept: 'image/*',
    label: '图片',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  error: [message: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const items = computed(() => props.modelValue ?? [])
const reachLimit = computed(() => items.value.length >= props.limit)
const cannotSelect = computed(() => props.limit > 1 && reachLimit.value)
const buttonText = computed(() => {
  if (uploading.value) return '上传中...'
  if (props.limit === 1 && items.value.length > 0) return `重新上传${props.label}`
  return `上传${props.label}`
})
const helperText = computed(() => `已上传 ${items.value.length}/${props.limit} 张`)

function openFileDialog() {
  inputRef.value?.click()
}

function updateValue(value: string[]) {
  emit('update:modelValue', value)
}

function removeAt(index: number) {
  updateValue(items.value.filter((_, currentIndex) => currentIndex !== index))
}

function resetNativeInput() {
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement | null
  const files = Array.from(target?.files ?? [])
  if (files.length === 0) {
    return
  }

  const remainCount = props.limit - items.value.length
  const selectedFiles = files.slice(0, Math.max(remainCount, 0))
  if (selectedFiles.length === 0) {
    resetNativeInput()
    return
  }

  uploading.value = true
  try {
    const uploadedUrls = await Promise.all(selectedFiles.map((file) => uploadImage(file, props.module)))
    const nextValue =
      props.limit === 1 ? uploadedUrls.slice(0, 1) : [...items.value, ...uploadedUrls].slice(0, props.limit)
    updateValue(nextValue)
  } catch (error) {
    const message = error instanceof Error ? error.message : '图片上传失败'
    emit('error', message)
  } finally {
    uploading.value = false
    resetNativeInput()
  }
}
</script>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-btn {
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.meta {
  font-size: 13px;
  color: var(--muted);
}

.native-input {
  display: none;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.preview {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: block;
  object-fit: cover;
  background: #f8fafc;
}

.card-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
}

.index {
  font-size: 12px;
  color: var(--muted);
}

.link {
  border: none;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
}

.link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link.danger {
  color: var(--danger);
}

.empty {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 18px 14px;
  font-size: 13px;
  color: var(--muted);
  background: #fff;
}
</style>
