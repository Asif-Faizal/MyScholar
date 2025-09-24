import DashboardLayout from '../../DashboardLayout'
import ClassHistory from '../ClassHistory'

export default function StudentClassesPage() {
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">Classes</h1>
        <ClassHistory />
      </div>
    </DashboardLayout>
  )
}


