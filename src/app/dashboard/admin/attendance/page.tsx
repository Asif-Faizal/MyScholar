import DashboardLayout from '../../DashboardLayout'
import UserPunchSummary from '../../UserPunchSummary'
import SessionHistory from '../SessionHistory'

export default function AdminAttendancePage() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">Attendance</h1>
        <UserPunchSummary />
        <SessionHistory />
      </div>
    </DashboardLayout>
  )
}


