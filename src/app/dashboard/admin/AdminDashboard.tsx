import AssignMapping from './AssignMapping';
import SessionHistory from './SessionHistory';
import UserManagement from './UserManagement';
import UserPunchSummary from '../UserPunchSummary';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-blue-800">Admin Dashboard</h1>
        <p className="text-blue-900/70 mt-1">Manage staff, tutors, students. View session history and analytics.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagement />
        <AssignMapping />
        <UserPunchSummary />
        <SessionHistory />
      </div>
    </div>
  );
}
