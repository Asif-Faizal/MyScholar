import PunchInOut from './PunchInOut';

export default function TutorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
      <p>See assigned student, punch in/out, share meeting link, view history.</p>
      {/* Replace with real tutorId and studentId from context/auth */}
      <PunchInOut tutorId={1} studentId={2} />
      {/* Add history component here */}
    </div>
  );
}
