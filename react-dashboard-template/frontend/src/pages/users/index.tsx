import { DataTable } from '@/components/data-table'
import { columns } from './columns'

const data = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-02',
  },
  // Add more mock data as needed
]

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage your users here</p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
