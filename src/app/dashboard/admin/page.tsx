import DashboardLayout from '../DashboardLayout';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  return (
    <DashboardLayout role="admin">
      <AdminDashboard />
    </DashboardLayout>
  );
}
