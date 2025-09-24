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
    Promise.all([
      apiFetch('/api/v1/users?role=teacher'),
      apiFetch('/api/v1/users?role=student')
    ])
      .then(([tRes, sRes]: any[]) => {
        setTutors(((tRes?.data?.users || tRes?.users) ?? []) as any[]);
        setStudents(((sRes?.data?.users || sRes?.users) ?? []) as any[]);
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
    <div className="mt-6 card">
      <h2 className="text-xl font-semibold mb-4">Assign Tutor to Student</h2>
      <div className="flex gap-3 mb-2">
        <select className="input" value={selectedTutor} onChange={(e: any) => setSelectedTutor(e.target.value)}>
          <option value="">Select Tutor</option>
          {tutors.map(t => <option key={t.user_id} value={t.user_id}>{t.alias || t.name}</option>)}
        </select>
        <select className="input" value={selectedStudent} onChange={(e: any) => setSelectedStudent(e.target.value)}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.user_id} value={s.user_id}>{s.alias || s.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedTutor || !selectedStudent || status==='loading'}>
          Assign
        </button>
      </div>
      {status==='success' && <div className="text-green-600">Mapping assigned!</div>}
      {status==='error' && <div className="text-red-600">Error assigning mapping.</div>}
    </div>
  );
}
