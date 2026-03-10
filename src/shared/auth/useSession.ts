import { queryClient } from '@/shared/api/queryClient'
import {
  fetchSessionProfile,
  type LoginRequest,
  loginRequest,
  type RegisterRequest,
  refreshTokenRequest,
  registerRequest,
} from '@/shared/auth/authService'
import { sessionStore } from '@/shared/auth/sessionStore'
import { useCallback } from 'react'
import { useStore } from 'zustand'

export const useSession = () => {
  const profile = useStore(sessionStore, (state) => state.profile)
  const token = useStore(sessionStore, (state) => state.token)
  const isAuthenticated = useStore(sessionStore, (state) => state.isAuthenticated)
  const isRestoring = useStore(sessionStore, (state) => state.isRestoring)

  const login = useCallback(async (credentials: LoginRequest) => {
    const result = await loginRequest(credentials)
    sessionStore.getState().setSession(result)
    return result.profile
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    const result = await registerRequest(payload)
    sessionStore.getState().setSession(result)
    return result.profile
  }, [])

  const logout = useCallback(() => {
    queryClient.clear()
    sessionStore.getState().logout()
  }, [])

  const restoreSession = useCallback(() => {
    sessionStore.getState().restoreSession()
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const profileResponse = await fetchSessionProfile()
      sessionStore.getState().setProfile(profileResponse)
      return profileResponse
    } catch (error) {
      queryClient.clear()
      sessionStore.getState().logout()
      throw error
    }
  }, [])

  const validateSession = useCallback(async () => {
    const currentState = sessionStore.getState()

    if (!currentState.token) {
      try {
        const { access_token } = await refreshTokenRequest()
        sessionStore.getState().setTokens({ token: access_token })
        const profileResponse = await fetchSessionProfile()
        sessionStore.getState().setProfile(profileResponse)
        return profileResponse
      } catch {
        queryClient.clear()
        sessionStore.getState().logout()
        return
      }
    }

    try {
      const profileResponse = await fetchSessionProfile()
      sessionStore.getState().setProfile(profileResponse)
      return profileResponse
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Token validation failed:', errorMessage)
      queryClient.clear()
      sessionStore.getState().logout()
      throw error
    }
  }, [])

  return {
    profile,
    token,
    user: profile?.user ?? null,
    abilities: profile?.abilities ?? [],
    roles: profile?.roles ?? [],
    company: profile?.company,
    isAuthenticated,
    isRestoring,
    login,
    register,
    logout,
    restoreSession,
    loadProfile,
    validateSession,
    role: profile?.roles[0] ?? null,
  }
}
