import { createStore } from 'zustand/vanilla';
import { SessionProfile, AuthTokens } from '../types/Session';
// import { SecureStorage } from '../core/security/SecureStorage'; // TODO: Re-enable when async support is added

const STORAGE_KEY = 'session';

interface PersistedSession {
  profile: SessionProfile | null;
  tokens: AuthTokens | null;
}

interface SessionState {
  profile: SessionProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  setSession: (payload: { profile: SessionProfile; tokens: AuthTokens }) => void;
  setProfile: (profile: SessionProfile) => void;
  clearSession: () => void;
  restoreSession: () => void;
  logout: (options?: { propagate?: boolean }) => void;
}

const readPersistedState = (): PersistedSession => {
  if (typeof window === 'undefined') {
    return { profile: null, tokens: null };
  }

  try {
    // Try to read from regular storage first
    const raw = localStorage.getItem(`fallback_${STORAGE_KEY}`);
    if (raw) {
      return JSON.parse(raw) as PersistedSession;
    }

    // Use regular storage for now since SecureStorage is async
    // TODO: Migrate to async SecureStorage in future update
    const secureData = localStorage.getItem(`secure_${STORAGE_KEY}`);
    if (secureData) {
      return JSON.parse(secureData) as PersistedSession;
    }
    return { profile: null, tokens: null };
  } catch (error) {
    console.warn('Failed to read session from secure storage', error);
    return { profile: null, tokens: null };
  }
};

const persistState = (state: PersistedSession) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Use regular storage for now since SecureStorage is async
    // TODO: Migrate to async SecureStorage in future update
    localStorage.setItem(`secure_${STORAGE_KEY}`, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist session state', error);
  }
};

const clearPersistedState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Clear both secure and fallback storage
    localStorage.removeItem(`secure_${STORAGE_KEY}`);
    localStorage.removeItem(`fallback_${STORAGE_KEY}`);
  } catch (error) {
    console.error('Failed to clear persisted state', error);
  }
};

export const sessionStore = createStore<SessionState>((set) => ({
  profile: null,
  tokens: null,
  isAuthenticated: false,
  isRestoring: true,
  setSession: ({ profile, tokens }) => {
    persistState({ profile, tokens });
    set({ profile, tokens, isAuthenticated: true, isRestoring: false });
  },
  setProfile: (profile) => {
    set((current) => {
      const nextState: PersistedSession = { profile, tokens: current.tokens };
      persistState(nextState);
      return {
        profile,
        tokens: current.tokens,
        isAuthenticated: Boolean(current.tokens?.accessToken),
        isRestoring: false
      };
    });
  },
  clearSession: () => {
    clearPersistedState();
    set({ profile: null, tokens: null, isAuthenticated: false, isRestoring: false });
  },
  restoreSession: () => {
    const persisted = readPersistedState();
    set({
      profile: persisted.profile,
      tokens: persisted.tokens,
      isAuthenticated: Boolean(persisted.tokens?.accessToken),
      isRestoring: false
    });
  },
  logout: ({ propagate } = { propagate: true }) => {
    clearPersistedState();
    set({ profile: null, tokens: null, isAuthenticated: false, isRestoring: false });
    if (propagate && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}));
