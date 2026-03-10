const rawPageSize = import.meta.env.VITE_PAGE_SIZE_DEFAULT ?? '20'
const resolvedPageSize = Number(rawPageSize)

const defaultApiBaseUrl =
  import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api')

export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  pageSize: Number.isFinite(resolvedPageSize) && resolvedPageSize > 0 ? resolvedPageSize : 20
} as const
