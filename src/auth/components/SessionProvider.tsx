import { PropsWithChildren, useEffect } from 'react';
import { useSession } from '../hooks/useSession';

export const SessionProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const { restoreSession, loadProfile, tokens, isRestoring } = useSession();

  // Restaurar sesión al montar
  useEffect(() => {
    console.log('Restoring session...');
    restoreSession();
  }, [restoreSession]);

  // Cargar perfil si hay token disponible
  useEffect(() => {
    console.log('Session state:', { isRestoring, hasToken: !!tokens?.accessToken });
    
    if (isRestoring) {
      return; // Esperar a que termine de restaurar
    }

    if (tokens?.accessToken) {
      console.log('Loading profile...');
      loadProfile().catch(error => {
        console.error('Failed to load profile:', error);
      });
    }
  }, [isRestoring, tokens?.accessToken, loadProfile]);

  // Solo mostrar loading mientras está restaurando la sesión inicial
  if (isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-sm">Loading session...</div>
      </div>
    );
  }

  return <>{children}</>;
};
