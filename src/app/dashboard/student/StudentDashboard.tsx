import ActiveMeeting from './ActiveMeeting';
import ClassHistory from './ClassHistory';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p>See assigned tutor, join active meeting, view class history.</p>
      {/* Replace with real studentId from context/auth */}
      <ActiveMeeting studentId={2} />
      <ClassHistory studentId={2} />
    </div>
  );
}
