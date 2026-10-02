import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts & Protected Route
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Common Pages
import ProfilePage from './pages/common/ProfilePage';
import ChangePasswordPage from './pages/common/ChangePasswordPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAddStorePage from './pages/admin/AdminAddStorePage';
import AdminAddUserPage from './pages/admin/AdminAddUserPage';

// User Pages
import UserStoresPage from './pages/user/UserStoresPage';
import UserMyRatingsPage from './pages/user/UserMyRatingsPage';

// Store Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerRatingsPage from './pages/owner/OwnerRatingsPage';

export default function App() {
  const { user, isAuthenticated, loading } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') return '/store-owner/dashboard';
    return '/user/stores';
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          loading ? null : isAuthenticated ? (
            <Navigate to={getHomeRedirect()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={getHomeRedirect()} replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to={getHomeRedirect()} replace /> : <RegisterPage />
        }
      />

      {/* Protected Routes inside App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Common Authenticated Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* System Administrator Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminStoresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-store"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAddStorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-user"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAddUserPage />
            </ProtectedRoute>
          }
        />

        {/* Normal User Routes */}
        <Route
          path="/user/stores"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserStoresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-ratings"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserMyRatingsPage />
            </ProtectedRoute>
          }
        />

        {/* Store Owner Routes */}
        <Route
          path="/store-owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-owner/ratings"
          element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <OwnerRatingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
