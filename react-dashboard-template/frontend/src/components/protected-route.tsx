import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}
