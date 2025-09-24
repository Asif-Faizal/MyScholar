"use client";

import { useEffect, useMemo, useState } from 'react';
import PunchInOut from './PunchInOut';
import { apiFetch } from '../api';

export default function TutorDashboard() {
  const [user, setUser] = useState<{ user_id: number; alias: string } | null>(null);
  const [student, setStudent] = useState<{ user_id: number; alias: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('today');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [rowMeetingLinks, setRowMeetingLinks] = useState<Record<number, string>>({});
  const [rowLoading, setRowLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      // fetch mapping for this tutor to get assigned student
      // fetch mapping for this tutor to get assigned student
      apiFetch('/api/v1/mappings')
        .then((res: any) => {
          const mappings = (res && (res.data || res)) as any[];
          const mine = (mappings || []).find((m: any) => m.tutorId === parsed.user_id);
          if (mine) setStudent({ user_id: mine.studentId, alias: mine.studentName });
        })
        .finally(() => setLoading(false));

      // load classes for this tutor
      fetch(`/api/v1/classes?teacher_id=${parsed.user_id}`)
        .then(r => r.json() as Promise<any>)
        .then((data: any) => setClasses(data.data?.classes || []))
        .catch(() => {})
        .finally(() => {});

      // poll active (not punched out) sessions for this tutor
      const loadActive = () => {
        apiFetch(`/api/v1/sessions?tutorId=${parsed.user_id}`)
          .then((res: any) => {
            const data = (res.data || res) as any[];
            const open = (data || []).filter((s) => !s.punch_out);
            setActiveSessions(open);
          })
          .catch(() => {});
      };
      loadActive();
      const id = setInterval(loadActive, 5000);
      return () => clearInterval(id);
    } else {
      setLoading(false);
    }
    return () => {};
  }, []);

  if (loading) return <div className="card">Loading...</div>;

  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const endOfToday = new Date();
  endOfToday.setHours(23,59,59,999);

  const startOfWeek = new Date(startOfToday);
  const day = startOfWeek.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  const filteredClasses = classes.filter((c) => {
    const start = new Date(c.start_time);
    if (filter === 'today') return start >= startOfToday && start <= endOfToday;
    if (filter === 'week') return start >= startOfWeek && start <= endOfWeek;
    return true;
  });

  const handleRowPunchIn = async (classId: number) => {
    if (!user || !student) return;
    setRowLoading((s) => ({ ...s, [classId]: true }));
    try {
      await apiFetch('/api/v1/sessions', {
        method: 'POST',
        body: JSON.stringify({ tutorId: user.user_id, studentId: student.user_id, meetingLink: rowMeetingLinks[classId] || '' })
      });
    } catch {
      // ignore for now
    } finally {
      setRowLoading((s) => ({ ...s, [classId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-blue-800">Tutor Dashboard</h1>
        {user && (
          <div className="mt-2 text-blue-900/80">Welcome, {user.alias} • Assigned Student: {student ? student.alias : 'Not assigned'}</div>
        )}
      </div>

      {user && student && (
        <div className="card">
          <h2 className="text-lg font-medium mb-2 text-blue-700">Start Session</h2>
          <PunchInOut tutorId={user.user_id} studentId={student.user_id} />
        </div>
      )}

      {activeSessions.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-medium text-blue-700 mb-2">Active Sessions</h2>
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Student</th>
                <th>Link</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2">{s.studentName}</td>
                  <td className="px-3 py-2">
                    {s.meeting_link ? (
                      <a className="text-blue-600 underline" href={s.meeting_link} target="_blank" rel="noreferrer">Join</a>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2">{s.punch_in}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-blue-700">My Classes</h2>
          <div className="flex gap-2">
            <button className={`btn ${filter==='today' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('today')}>Today</button>
            <button className={`btn ${filter==='week' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('week')}>This Week</button>
            <button className={`btn ${filter==='all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All</button>
          </div>
        </div>
        <table className="table text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-1">Class ID</th>
              <th className="px-2 py-1">Start</th>
              <th className="px-2 py-1">End</th>
              <th className="px-2 py-1">Meet</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((c) => (
              <tr key={c.class_id}>
                <td className="px-2 py-1">{c.class_id}</td>
                <td className="px-2 py-1">{new Date(c.start_time).toLocaleString()}</td>
                <td className="px-2 py-1">{new Date(c.end_time).toLocaleString()}</td>
                <td className="px-2 py-1">
                  {c.meet_link ? <a className="text-blue-600 underline" href={c.meet_link} target="_blank" rel="noreferrer">Join</a> : '-'}
                </td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <input
                      className="input"
                      placeholder="Meeting link"
                      value={rowMeetingLinks[c.class_id] || ''}
                      onChange={(e: any) => {
                        const value = e.target.value as string;
                        setRowMeetingLinks((m) => ({ ...m, [c.class_id]: value }));
                      }}
                    />
                    <button
                      className="btn btn-primary disabled:opacity-50"
                      onClick={() => handleRowPunchIn(c.class_id)}
                      disabled={rowLoading[c.class_id]}
                    >
                      {rowLoading[c.class_id] ? 'Punching...' : 'Punch In'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredClasses.length === 0 && (
              <tr><td className="px-2 py-2 text-gray-500" colSpan={4}>No classes yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
