import DashboardLayout from '../DashboardLayout';
import StaffDashboard from './StaffDashboard';

export default function StaffPage() {
  return (
    <DashboardLayout role="staff">
      <StaffDashboard />
    </DashboardLayout>
  );
}
