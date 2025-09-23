import { useCallback } from 'react';
import { useStore } from 'zustand';
import { sessionStore } from '../sessionStore';
import { LoginRequest, loginRequest, fetchSessionProfile } from '../services/authService';
import { queryClient } from '../../core/api/queryClient';

export const useSession = () => {
  // Separar los selectores para evitar crear objetos nuevos en cada render
  const profile = useStore(sessionStore, (state) => state.profile);
  const tokens = useStore(sessionStore, (state) => state.tokens);
  const isAuthenticated = useStore(sessionStore, (state) => state.isAuthenticated);
  const isRestoring = useStore(sessionStore, (state) => state.isRestoring);

  const login = useCallback(async (credentials: LoginRequest) => {
    const result = await loginRequest(credentials);
    sessionStore.getState().setSession(result);
    return result.profile;
  }, []);

  const logout = useCallback(() => {
    queryClient.clear();
    sessionStore.getState().logout();
  }, []);

  const restoreSession = useCallback(() => {
    sessionStore.getState().restoreSession();
  }, []);

  const loadProfile = useCallback(async () => {
    // Evitar cargar el perfil múltiples veces si ya existe
    const currentState = sessionStore.getState();
    if (currentState.profile) {
      return currentState.profile;
    }

    try {
      const profileResponse = await fetchSessionProfile();
      sessionStore.getState().setProfile(profileResponse);
      return profileResponse;
    } catch (error) {
      queryClient.clear();
      sessionStore.getState().logout();
      throw error;
    }
  }, []);

  return {
    profile,
    tokens,
    user: profile?.user ?? null,
    abilities: profile?.abilities ?? [],
    roles: profile?.roles ?? [],
    company: profile?.company,
    country: profile?.country,
    isAuthenticated,
    isRestoring,
    login,
    logout,
    restoreSession,
    loadProfile
  };
};
