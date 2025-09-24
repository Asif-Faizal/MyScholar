"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function SessionHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/sessions/history')
      .then((res: any) => setSessions(res.data || res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Session History</h2>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-2 py-1 border">Tutor</th>
            <th className="px-2 py-1 border">Student</th>
            <th className="px-2 py-1 border">Link</th>
            <th className="px-2 py-1 border">Punch In</th>
            <th className="px-2 py-1 border">Punch Out</th>
            <th className="px-2 py-1 border">Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td className="border px-2 py-1">{s.tutorName}</td>
              <td className="border px-2 py-1">{s.studentName}</td>
              <td className="border px-2 py-1"><a href={s.meeting_link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join</a></td>
              <td className="border px-2 py-1">{s.punch_in}</td>
              <td className="border px-2 py-1">{s.punch_out}</td>
              <td className="border px-2 py-1">{s.duration ? Math.round(s.duration/60) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
