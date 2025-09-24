import SessionHistory from './SessionHistory';
import UserManagement from '../admin/UserManagement';
import UserPunchSummary from '../UserPunchSummary';
import AssignMapping from '../admin/AssignMapping';

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      <p>Manage tutors and students. View session history and analytics.</p>
      {/* Add management and analytics components here */}
      <UserManagement />
      <AssignMapping />
      <UserPunchSummary />
      <SessionHistory />
    </div>
  );
}
