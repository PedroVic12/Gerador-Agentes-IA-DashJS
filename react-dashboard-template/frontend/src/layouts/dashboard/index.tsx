import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
