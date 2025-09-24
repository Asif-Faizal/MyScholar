"use client";

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from './api';

type RoleOption = 'teacher' | 'student';

export default function UserPunchSummary() {
  const [role, setRole] = useState<RoleOption>('teacher');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ reports: any[]; stats: any } | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    setLoadingUsers(true);
    apiFetch(`/api/v1/users?role=${role}`)
      .then((res: any) => setUsers(res.data?.users || res.users || []))
      .finally(() => setLoadingUsers(false));
  }, [role]);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingSummary(true);
    apiFetch(`/api/v1/attendance?user_id=${selectedUserId}`)
      .then((res: any) => setSummary(res.data || res))
      .finally(() => setLoadingSummary(false));
  }, [selectedUserId]);

  const selectedUser = useMemo(() => users.find((u) => u.user_id === selectedUserId), [users, selectedUserId]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Punch Summary</h2>
      <div className="flex gap-3 items-center mb-4">
        <label className="text-sm">Role</label>
        <select value={role} onChange={(e: any) => setRole(e.target.value as RoleOption)} className="border px-2 py-1 rounded">
          <option value="teacher">Tutor</option>
          <option value="student">Student</option>
        </select>
        <label className="text-sm">User</label>
        {loadingUsers ? (
          <span>Loading users...</span>
        ) : (
          <select
            className="border px-2 py-1 rounded min-w-64"
            value={selectedUserId ?? ''}
            onChange={(e: any) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select {role === 'teacher' ? 'tutor' : 'student'}</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>{u.alias} ({u.email})</option>
            ))}
          </select>
        )}
      </div>

      {loadingSummary && <div>Loading summary...</div>}

      {summary && selectedUser && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-2">{selectedUser.alias} — Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Total Classes" value={summary.stats.total_classes} />
              <Stat label="Attended" value={summary.stats.attended_classes} />
              <Stat label="On Time" value={summary.stats.on_time_classes} />
              <Stat label="Late" value={summary.stats.late_classes} />
              <Stat label="Partial" value={summary.stats.partial_classes} />
              <Stat label="Absent" value={summary.stats.absent_classes} />
              <Stat label="Attendance Rate" value={`${summary.stats.attendance_rate}%`} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Sessions</h3>
            <table className="min-w-full bg-white border rounded shadow text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 border text-left">Scheduled Start</th>
                  <th className="px-2 py-1 border text-left">Scheduled End</th>
                  <th className="px-2 py-1 border text-left">Punch In</th>
                  <th className="px-2 py-1 border text-left">Punch Out</th>
                  <th className="px-2 py-1 border text-left">Status</th>
                  <th className="px-2 py-1 border text-left">Link</th>
                </tr>
              </thead>
              <tbody>
                {summary.reports.map((r, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{formatTime(r.scheduled_start)}</td>
                    <td className="border px-2 py-1">{formatTime(r.scheduled_end)}</td>
                    <td className="border px-2 py-1">{formatTime(r.actual_punch_in)}</td>
                    <td className="border px-2 py-1">{formatTime(r.actual_punch_out)}</td>
                    <td className="border px-2 py-1 capitalize">{r.attendance_status.replace('_',' ')}</td>
                    <td className="border px-2 py-1">{r.meet_link ? <a className="text-blue-600 underline" href={r.meet_link} target="_blank" rel="noreferrer">Join</a> : '-'}</td>
                  </tr>
                ))}
                {summary.reports.length === 0 && (
                  <tr><td className="border px-2 py-2 text-center" colSpan={6}>No sessions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 bg-white rounded border">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function formatTime(value: string | null): string {
  if (!value) return '-';
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return value;
  }
}


