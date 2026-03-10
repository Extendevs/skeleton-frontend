import type { SessionProfile } from '@/shared/auth/Session'
import { createStore } from 'zustand/vanilla'

const STORAGE_KEY = 'session'

/** Only profile is persisted (no tokens). Tokens live in memory only; refresh uses httpOnly cookie. */
interface PersistedSession {
  profile: SessionProfile | null
}

interface SessionState {
  profile: SessionProfile | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isRestoring: boolean
  setSession: (_payload: { profile: SessionProfile; token: string }) => void
  setTokens: (_payload: { token: string }) => void
  setProfile: (_profile: SessionProfile) => void
  clearSession: () => void
  restoreSession: () => void
  logout: (_options?: { propagate?: boolean }) => void
}

const readPersistedState = (): PersistedSession => {
  if (typeof window === 'undefined') {
    return { profile: null }
  }

  try {
    const raw = localStorage.getItem(`fallback_${STORAGE_KEY}`)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedSession
      return { profile: parsed.profile ?? null }
    }

    const secureData = localStorage.getItem(`secure_${STORAGE_KEY}`)
    if (secureData) {
      const parsed = JSON.parse(secureData) as PersistedSession
      return { profile: parsed.profile ?? null }
    }
    return { profile: null }
  } catch (error) {
    console.warn('Failed to read session from storage', error)
    return { profile: null }
  }
}

const persistState = (state: PersistedSession) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(`secure_${STORAGE_KEY}`, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to persist session state', error)
  }
}

const clearPersistedState = () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(`secure_${STORAGE_KEY}`)
    localStorage.removeItem(`fallback_${STORAGE_KEY}`)
  } catch (error) {
    console.error('Failed to clear persisted state', error)
  }
}

export const sessionStore = createStore<SessionState>((set) => ({
  profile: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isAuthenticating: false,
  isRestoring: true,
  setSession: ({ profile, token }) => {
    persistState({ profile })
    set({
      profile,
      token,
      refreshToken: null,
      isAuthenticated: true,
      isRestoring: false
    })
  },
  setTokens: ({ token }) => {
    set((_current) => ({
      token,
      refreshToken: null,
      isAuthenticated: Boolean(token)
    }))
  },
  setProfile: (profile) => {
    set((current) => {
      persistState({ profile })
      return {
        profile,
        token: current.token,
        refreshToken: current.refreshToken,
        isAuthenticated: Boolean(current.token),
        isRestoring: false
      }
    })
  },
  clearSession: () => {
    clearPersistedState()
    set({
      profile: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: false
    })
  },
  restoreSession: () => {
    const persisted = readPersistedState()
    set({
      profile: persisted.profile,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: Boolean(persisted.profile)
    })
  },
  logout: ({ propagate } = { propagate: true }) => {
    clearPersistedState()
    set({
      profile: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: false
    })
    if (propagate && typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}))
