const rawPageSize = import.meta.env.VITE_PAGE_SIZE_DEFAULT ?? '10';
const resolvedPageSize = Number(rawPageSize);

export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  pageSize: Number.isFinite(resolvedPageSize) && resolvedPageSize > 0 ? resolvedPageSize : 10
} as const;
