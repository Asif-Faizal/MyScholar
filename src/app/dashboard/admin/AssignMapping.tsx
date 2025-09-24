"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function AssignMapping() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    apiFetch('/api/v1/users')
      .then((res) => {
        setTutors((res.data.users || res).filter((u: any) => u.role === 'tutor'));
        setStudents((res.data.users || res).filter((u: any) => u.role === 'student'));
      });
  }, []);

  const handleAssign = async () => {
    setStatus('loading');
    try {
      await apiFetch('/api/v1/mappings', {
        method: 'POST',
        body: JSON.stringify({ tutorId: selectedTutor, studentId: selectedStudent })
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Assign Tutor to Student</h2>
      <div className="flex gap-4 mb-2">
        <select className="border px-2 py-1 rounded" value={selectedTutor} onChange={e => setSelectedTutor(e.target.value)}>
          <option value="">Select Tutor</option>
          {tutors.map(t => <option key={t.user_id} value={t.user_id}>{t.alias || t.name}</option>)}
        </select>
        <select className="border px-2 py-1 rounded" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.user_id} value={s.user_id}>{s.alias || s.name}</option>)}
        </select>
        <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleAssign} disabled={!selectedTutor || !selectedStudent || status==='loading'}>
          Assign
        </button>
      </div>
      {status==='success' && <div className="text-green-600">Mapping assigned!</div>}
      {status==='error' && <div className="text-red-600">Error assigning mapping.</div>}
    </div>
  );
}
