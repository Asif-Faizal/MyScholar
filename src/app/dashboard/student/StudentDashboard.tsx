import ActiveMeeting from './ActiveMeeting';
import ClassHistory from './ClassHistory';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-blue-800">Student Dashboard</h1>
        <p className="text-blue-900/70 mt-1">See assigned tutor, join active meeting, view class history.</p>
      </div>
      <ActiveMeeting />
      <ClassHistory />
    </div>
  );
}
