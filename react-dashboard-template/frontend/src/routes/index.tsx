import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard'
import { AuthLayout } from '@/layouts/auth'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { DashboardPage } from '@/pages/dashboard'
import { UsersPage } from '@/pages/users'
import { SettingsPage } from '@/pages/settings'
import { NotFoundPage } from '@/pages/404'
import { ProtectedRoute } from '@/components/protected-route'

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
