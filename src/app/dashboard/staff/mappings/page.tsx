import DashboardLayout from '../../DashboardLayout'
import AssignMapping from '../../admin/AssignMapping'

export default function StaffMappingsPage() {
  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">Mappings</h1>
        <AssignMapping />
      </div>
    </DashboardLayout>
  )
}


