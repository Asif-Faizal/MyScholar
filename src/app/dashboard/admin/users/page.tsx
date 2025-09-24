import DashboardLayout from '../../DashboardLayout'
import UserManagement from '../UserManagement'

export default function AdminUsersPage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">Users</h1>
        <UserManagement />
      </div>
    </DashboardLayout>
  )
}


