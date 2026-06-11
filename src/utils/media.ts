const ABSOLUTE_URL_RE = /^(https?:)?\/\//i

function normalizePath(value: string) {
  const normalized = value.trim().replace(/\\/g, '/')
  if (!normalized) {
    return ''
  }

  if (ABSOLUTE_URL_RE.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized
  }

  if (normalized.startsWith('/')) {
    return normalized
  }

  return `/${normalized}`
}

export function resolveMediaUrl(value: string) {
  return normalizePath(value)
}
