import DashboardLayout from '../../DashboardLayout'
import UserPunchSummary from '../../UserPunchSummary'
import SessionHistory from '../../admin/SessionHistory'

export default function StaffAttendancePage() {
  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">Attendance</h1>
        <UserPunchSummary />
        <SessionHistory />
      </div>
    </DashboardLayout>
  )
}


