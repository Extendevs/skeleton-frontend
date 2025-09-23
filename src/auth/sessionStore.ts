import { createStore } from 'zustand/vanilla';
import { SessionProfile, AuthTokens } from '../types/Session';

const STORAGE_KEY = 'core-react-session';

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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { profile: null, tokens: null };
    }
    return JSON.parse(raw) as PersistedSession;
  } catch (error) {
    console.warn('Failed to parse session from storage', error);
    return { profile: null, tokens: null };
  }
};

const persistState = (state: PersistedSession) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const clearPersistedState = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
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
