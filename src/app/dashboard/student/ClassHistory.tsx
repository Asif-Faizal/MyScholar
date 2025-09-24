"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function ClassHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { setLoading(false); return; }
    const parsed = JSON.parse(userData);
    setStudentId(parsed.user_id);
    apiFetch(`/api/v1/sessions?studentId=${parsed.user_id}`)
      .then((res: any) => setSessions(res.data || res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Class History</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Tutor</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Link</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Punch In</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Punch Out</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Duration (min)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {sessions.map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-2">{s.tutorName}</td>
              <td className="px-3 py-2"><a href={s.meeting_link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join</a></td>
              <td className="px-3 py-2">{s.punch_in}</td>
              <td className="px-3 py-2">{s.punch_out}</td>
              <td className="px-3 py-2">{s.duration ? Math.round(s.duration/60) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
