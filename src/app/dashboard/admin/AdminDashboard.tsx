import AssignMapping from './AssignMapping';
import SessionHistory from './SessionHistory';
import UserManagement from './UserManagement';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Manage staff, tutors, students. View session history and analytics.</p>
      {/* Add management and analytics components here */}
      <SessionHistory />
      <UserManagement />
      <AssignMapping />
    </div>
  );
}
