"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function ActiveMeeting() {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { setLoading(false); return; }
    const parsed = JSON.parse(userData);
    setStudentId(parsed.user_id);

    let isMounted = true;
    const fetchActive = () => {
      apiFetch(`/api/v1/sessions?studentId=${parsed.user_id}`)
        .then((res: any) => {
          if (!isMounted) return;
          const data = (res.data || res) as any[];
          const openSessions = (data || []).filter((s) => !s.punch_out);
          // pick the most recent open session
          const active = openSessions.sort((a, b) => new Date(b.punch_in).getTime() - new Date(a.punch_in).getTime())[0] || null;
          setMeeting(active);
        })
        .finally(() => { if (isMounted) setLoading(false); });
    };

    // initial fetch and poll every 5s
    fetchActive();
    const id = setInterval(fetchActive, 5000);
    return () => { isMounted = false; clearInterval(id); };
  }, []);

  if (loading) return <div className="card">Loading...</div>;
  if (!meeting) return <div className="card">No active meeting.</div>;

  return (
    <div className="card">
      <div className="font-semibold mb-1">Active Meeting Link</div>
      <a href={meeting.meeting_link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join Class</a>
      <div className="text-sm mt-2">Started at: {meeting.punch_in}</div>
    </div>
  );
}
