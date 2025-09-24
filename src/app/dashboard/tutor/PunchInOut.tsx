"use client";

import { useState } from 'react';
import { apiFetch } from '../api';

export default function PunchInOut({ tutorId, studentId }: { tutorId: number, studentId: number }) {
  const [meetingLink, setMeetingLink] = useState('');
  const [sessionId, setSessionId] = useState<number|null>(null);
  const [status, setStatus] = useState('idle');

  const handlePunchIn = async () => {
    setStatus('loading');
    try {
      const res: any = await apiFetch('/api/v1/sessions', {
        method: 'POST',
        body: JSON.stringify({ tutorId, studentId, meetingLink })
      });
      setSessionId(res.sessionId);
      setStatus('punched-in');
    } catch (e) {
      setStatus('error');
    }
  };

  const handlePunchOut = async () => {
    setStatus('loading');
    try {
      await apiFetch('/api/v1/sessions', {
        method: 'PUT',
        body: JSON.stringify({ sessionId })
      });
      setStatus('punched-out');
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        className="border px-2 py-1 rounded w-full"
        placeholder="Meeting Link"
        value={meetingLink}
        onChange={(e: any) => setMeetingLink(e.target.value as string)}
        disabled={!!sessionId}
      />
      <div>
        {!sessionId ? (
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handlePunchIn} disabled={status==='loading'}>
            Punch In & Share Link
          </button>
        ) : (
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handlePunchOut} disabled={status==='loading' || status==='punched-out'}>
            Punch Out
          </button>
        )}
      </div>
      {status==='punched-in' && <div className="text-green-600">Session started. Link shared with student.</div>}
      {status==='punched-out' && <div className="text-blue-600">Session completed.</div>}
      {status==='error' && <div className="text-red-600">Error. Try again.</div>}
    </div>
  );
}
