"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function ActiveMeeting({ studentId }: { studentId: number }) {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/v1/sessions?studentId=${studentId}`)
      .then((res) => {
        const active = res.data.find((s: any) => !s.punch_out);
        setMeeting(active);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div>Loading...</div>;
  if (!meeting) return <div>No active meeting.</div>;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded">
      <div className="font-semibold">Active Meeting Link:</div>
      <a href={meeting.meeting_link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join Class</a>
      <div className="text-sm mt-2">Started at: {meeting.punch_in}</div>
    </div>
  );
}
