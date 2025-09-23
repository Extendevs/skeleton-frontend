import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/components/ProtectedRoute';
import { PublicRoute } from '../auth/components/PublicRoute';
import { LoginPage } from '../auth/pages/LoginPage';
import { AppLayout } from './AppLayout';
import { CategoriesPage } from '../modules/categories/CategoriesPage';

export const App = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
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
          <Route index element={<CategoriesPage />} />
          <Route path=":categoryId" element={<CategoriesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/categories" replace />} />
    </Routes>
  );
};
