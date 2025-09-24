"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ alias: '', email: '', password: '', role: 'teacher' });
  const [formStatus, setFormStatus] = useState('idle');

  const fetchUsers = () => apiFetch('/api/v1/users')
    .then((res: any) => setUsers(res.data?.users || res))
    .finally(() => setLoading(false));

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormChange = (e: any) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setForm({ ...form, [name]: value });
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
      setForm({ alias: '', email: '', password: '', role: 'teacher' });
      fetchUsers();
    } catch {
      setFormStatus('error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-6 card">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <form className="mb-6" onSubmit={handleCreateUser}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input name="alias" value={form.alias} onChange={handleFormChange} className="input" placeholder="Name" required />
          <input name="email" value={form.email} onChange={handleFormChange} className="input" placeholder="Email" required />
          <input name="password" type="password" value={form.password} onChange={handleFormChange} className="input" placeholder="Password" required />
          <select name="role" value={form.role} onChange={handleFormChange} className="input">
            <option value="teacher">Tutor</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn btn-primary">Add</button>
        </div>
        <div className="mt-2 min-h-[20px]">
          {formStatus==='success' && <div className="text-green-600 text-sm">User added!</div>}
          {formStatus==='error' && <div className="text-red-600 text-sm">Error adding user.</div>}
        </div>
      </form>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Name</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Email</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Role</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {users.map((u) => (
            <tr key={u.user_id || u.id}>
              <td className="px-3 py-2">{u.alias || u.name}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2 capitalize">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
