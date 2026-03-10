import { refreshTokenRequest } from '@/shared/auth/authService'
import { sessionStore } from '@/shared/auth/sessionStore'
import { APP_CONFIG } from '@/shared/config/appConfig'
import { usePermissionsModal } from '@/shared/hooks/usePermissionsModal'
import axios, { type AxiosRequestConfig, type AxiosRequestHeaders } from 'axios'

export interface ApiErrorPayload {
  message?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  status?: number
  payload?: ApiErrorPayload

  constructor(message: string, status?: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload as ApiErrorPayload | undefined
  }
}

/**
 * Builds a user-facing error message from API validation/error response.
 * Uses message and, if present, flattens errors object into a short description.
 */
export function formatApiErrorMessage(apiError: ApiError): { title: string; description?: string } {
  const payload = apiError.payload
  const title = payload?.message ?? apiError.message ?? 'Error al guardar'
  const errors = payload?.errors
  if (errors && typeof errors === 'object') {
    const lines = Object.values(errors).flat().filter(Boolean) as string[]
    if (lines.length > 0) {
      return { title, description: lines.slice(0, 5).join(' ') }
    }
  }
  return { title }
}

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000,
  withCredentials: true
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStore.getState().token

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders
  }
  return config
})

let refreshPromise: Promise<{ access_token: string } | null> | null = null

function logoutAndReject(
  error: unknown,
  status: number,
  message: string
): Promise<never> {
  refreshPromise = null
  sessionStore.getState().logout({ propagate: false })
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
  const payload = error && typeof error === 'object' && 'response' in error
    ? (error as { response?: { data?: unknown } }).response?.data
    : undefined
  return Promise.reject(new ApiError(message, status, payload))
}

function ensureRefreshPromise(): void {
  if (refreshPromise) return
  refreshPromise = refreshTokenRequest()
    .then((data) => data)
    .catch((err) => {
      refreshPromise = null
      throw err
    })
    .finally(() => {
      refreshPromise = null
    })
}

function getErrorMessage(error: { response?: { data?: unknown } }, fallback: string): string {
  return (error.response?.data as { message?: string })?.message ?? fallback
}

function reject401(error: unknown, status: number, message: string): Promise<never> {
  const payload =
    error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: unknown } }).response?.data
      : undefined
  return Promise.reject(new ApiError(message, status, payload))
}

function hadAuthorizationHeader(config: AxiosRequestConfig): boolean {
  const headers = config.headers as Record<string, unknown> | undefined
  return Boolean(headers?.Authorization)
}

async function handle401Retry(
  error: { response?: { status?: number; data?: unknown } },
  originalConfig: AxiosRequestConfig & { _retry?: boolean }
): Promise<unknown> {
  const status = error.response?.status ?? 401
  const message = getErrorMessage(error, 'Unauthorized')

  if (originalConfig._retry) {
    return logoutAndReject(error, status, message)
  }

  if (!hadAuthorizationHeader(originalConfig)) {
    return reject401(error, status, message)
  }

  ensureRefreshPromise()

  try {
    const tokens = await refreshPromise
    if (tokens) {
      sessionStore.getState().setTokens({
        token: tokens.access_token
      })
      originalConfig._retry = true
      return apiClient.request(originalConfig)
    }
  } catch {
    return logoutAndReject(error, status, getErrorMessage(error, 'Session expired'))
  }

  return logoutAndReject(error, status, message)
}

function handle403(error: { response?: { data?: unknown }; config?: { method?: string; url?: string } }): void {
  const errorData = error.response?.data as { message?: string } | undefined
  const method = error.config?.method?.toUpperCase() ?? 'REQUEST'
  const url = error.config?.url ?? ''
  const message = errorData?.message ?? 'No tienes permisos para realizar esta acción'
  const actionDescription = `${method} ${url}`
  usePermissionsModal.getState().openModal(message, actionDescription)
}

function rejectWithApiError(error: {
  response?: { data?: ApiErrorPayload; status?: number }
  message?: string
}): Promise<never> {
  const status = error.response?.status
  const message =
    error.response?.data?.message ?? error.message ?? 'Unexpected error, please try again'
  return Promise.reject(new ApiError(message, status, error.response?.data))
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    if (status === 401) {
      const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean }
      return handle401Retry(error, originalConfig)
    }
    if (status === 403) {
      handle403(error)
    }
    return rejectWithApiError(error)
  }
)
