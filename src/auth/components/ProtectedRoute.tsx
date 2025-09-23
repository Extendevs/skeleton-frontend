import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export const ProtectedRoute = ({ children }: PropsWithChildren): JSX.Element => {
  const { isAuthenticated } = useSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
