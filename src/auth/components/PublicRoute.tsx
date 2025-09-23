import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export const PublicRoute = ({ children }: PropsWithChildren): JSX.Element => {
  const { isAuthenticated } = useSession();

  if (isAuthenticated) {
    return <Navigate to="/categories" replace />;
  }

  return <>{children}</>;
};
