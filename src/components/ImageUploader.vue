<template>
  <div class="uploader">
    <button
      class="trigger-card"
      type="button"
      :class="{ 'is-disabled': disabled || uploading, 'is-single-filled': isSingleFilled }"
      :disabled="disabled || uploading || cannotSelect"
      @click="openFileDialog"
    >
      <div v-if="isSingleFilled" class="single-preview">
        <img :src="resolveMediaUrl(items[0])" :alt="label" />
      </div>
      <div class="trigger-content">
        <div class="trigger-title">{{ buttonText }}</div>
        <div class="trigger-subtitle">{{ helperText }}</div>
        <div class="trigger-tips">{{ tipsText }}</div>
      </div>
    </button>

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
          <div>
            <div class="index">{{ label }} {{ index + 1 }}</div>
            <div class="index-sub">点击上方区域可继续上传</div>
          </div>
          <button class="link danger" type="button" :disabled="disabled || uploading" @click.stop="removeAt(index)">
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      暂无图片，建议上传清晰的横图或方图，提升小程序展示效果
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
const isSingleFilled = computed(() => props.limit === 1 && items.value.length > 0)
const buttonText = computed(() => {
  if (uploading.value) return '上传中...'
  if (props.limit === 1 && items.value.length > 0) return `更换${props.label}`
  return `上传${props.label}`
})
const helperText = computed(() => `当前 ${items.value.length}/${props.limit} 张`)
const tipsText = computed(() =>
  props.limit === 1
    ? '支持 JPG、PNG、WEBP，点击后直接选择文件'
    : `支持批量上传，最多可选择 ${props.limit} 张`,
)

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
  gap: 14px;
}

.trigger-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 132px;
  padding: 18px;
  border: 1px dashed rgba(37, 99, 235, 0.32);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0.02)),
    #fff;
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.trigger-card:hover {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.46);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.trigger-card.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.trigger-card.is-single-filled {
  padding-left: 14px;
}

.single-preview {
  width: 96px;
  height: 96px;
  flex: 0 0 96px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(37, 99, 235, 0.12);
  background: #fff;
}

.single-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.trigger-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.trigger-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-h);
}

.trigger-subtitle,
.trigger-tips {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.native-input {
  display: none;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.card {
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.preview {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
  object-fit: cover;
  background: #f8fafc;
}

.card-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
}

.index {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-h);
}

.index-sub {
  margin-top: 4px;
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
  border-radius: 16px;
  padding: 18px 14px;
  font-size: 13px;
  color: var(--muted);
  background: #fff;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .trigger-card {
    min-height: 118px;
    padding: 16px;
  }

  .list {
    grid-template-columns: 1fr;
  }
}
</style>
