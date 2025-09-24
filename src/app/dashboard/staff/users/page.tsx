import DashboardLayout from '../../DashboardLayout'
import UserManagement from '../../admin/UserManagement'

export default function StaffUsersPage() {
  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">Users</h1>
        <UserManagement />
      </div>
    </DashboardLayout>
  )
}


