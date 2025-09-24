import DashboardLayout from '../DashboardLayout';
import StudentDashboard from './StudentDashboard';

export default function StudentPage() {
  return (
    <DashboardLayout role="student">
      <StudentDashboard />
    </DashboardLayout>
  );
}
