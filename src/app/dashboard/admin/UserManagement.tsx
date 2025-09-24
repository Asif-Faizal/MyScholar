"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ alias: '', email: '', password: '', role: 'tutor' });
  const [formStatus, setFormStatus] = useState('idle');

  useEffect(() => {
    apiFetch('/api/v1/users')
      .then((res) => setUsers(res.data.users || res))
      .finally(() => setLoading(false));
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      await apiFetch('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setFormStatus('success');
      setForm({ alias: '', email: '', password: '', role: 'tutor' });
    } catch {
      setFormStatus('error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">User Management</h2>
      <form className="mb-4 p-4 bg-gray-100 rounded" onSubmit={handleCreateUser}>
        <div className="flex gap-4 mb-2">
          <input name="alias" value={form.alias} onChange={handleFormChange} className="border px-2 py-1 rounded w-1/4" placeholder="Name" required />
          <input name="email" value={form.email} onChange={handleFormChange} className="border px-2 py-1 rounded w-1/4" placeholder="Email" required />
          <input name="password" type="password" value={form.password} onChange={handleFormChange} className="border px-2 py-1 rounded w-1/4" placeholder="Password" required />
          <select name="role" value={form.role} onChange={handleFormChange} className="border px-2 py-1 rounded w-1/4">
            <option value="tutor">Tutor</option>
            <option value="student">Student</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Add</button>
        </div>
        {formStatus==='success' && <div className="text-green-600">User added!</div>}
        {formStatus==='error' && <div className="text-red-600">Error adding user.</div>}
      </form>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-2 py-1 border">Name</th>
            <th className="px-2 py-1 border">Email</th>
            <th className="px-2 py-1 border">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id || u.id}>
              <td className="border px-2 py-1">{u.alias || u.name}</td>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
