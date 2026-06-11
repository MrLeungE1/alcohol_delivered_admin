import service from '@/utils/axios'

export type UploadModule = 'product' | 'activity' | 'home' | string

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractUrl(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  if (!isRecord(value)) {
    return null
  }

  const directKeys = ['url', 'file_url', 'image_url', 'src', 'location', 'path']
  for (const key of directKeys) {
    const candidate = value[key]
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate
    }
  }

  const nestedKeys = ['data', 'result', 'payload']
  for (const key of nestedKeys) {
    const candidate = extractUrl(value[key])
    if (candidate) {
      return candidate
    }
  }

  return null
}

export async function uploadImage(file: File, module: UploadModule = 'product') {
  const formData = new FormData()
  formData.append('file', file)

  const response = await service.post('/upload/upload', formData, {
    params: { module },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  const url = extractUrl(response)
  if (!url) {
    throw new Error('上传成功，但未能从返回结果中解析图片地址')
  }

  return url
}
