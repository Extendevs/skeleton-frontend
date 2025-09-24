import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { PublicRoute } from '../auth/components/PublicRoute';
import { AppLayout } from './AppLayout';

// Lazy loaded components for better performance
const LoginPage = lazy(() => import('../auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const CategoriesListPage = lazy(() => import('../modules/categories/CategoriesListPage').then(module => ({ default: module.CategoriesListPage })));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Cargando...</span>
  </div>
);

export const App = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/categories" replace />} />
        <Route path="categories">
          <Route 
            index 
            element={
              <Suspense fallback={<PageLoader />}>
                <CategoriesListPage />
              </Suspense>
            } 
          />
          <Route 
            path=":categoryId" 
            element={
              <Suspense fallback={<PageLoader />}>
                <CategoriesListPage />
              </Suspense>
            } 
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/categories" replace />} />
    </Routes>
  );
};
