import { PropsWithChildren, useEffect, useRef } from 'react';
import { useSession } from '../hooks/useSession';
import { sessionStore } from '../sessionStore';

export const SessionProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const { restoreSession, validateSession, tokens, isRestoring } = useSession();
  const hasInitialized = useRef(false);

  // Inicializar sesión al montar
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeSession = async () => {
      // 1. Restaurar tokens del localStorage
      restoreSession();
      
      // 2. Si hay token, validar con /me
      const currentState = sessionStore.getState();
      if (currentState.tokens?.accessToken) {
        try {
          await validateSession();
        } catch (error) {
          console.warn('Token validation failed, redirecting to login');
          // El hook ya maneja el logout y redirect
        }
      }
    };

    initializeSession();
  }, [restoreSession, validateSession]);

  // Mostrar loading mientras está restaurando/validando
  if (isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-sm">Loading session...</div>
      </div>
    );
  }

  return <>{children}</>;
};
