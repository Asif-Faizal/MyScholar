import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

interface DashboardLayoutProps {
  role: 'admin' | 'staff' | 'tutor' | 'student';
  children: React.ReactNode;
}

const navItems: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: 'Manage Users', href: '/dashboard/admin' },
    { label: 'Session History', href: '/dashboard/admin/history' },
    { label: 'Analytics', href: '/dashboard/admin/analytics' },
  ],
  staff: [
    { label: 'Manage Users', href: '/dashboard/staff' },
    { label: 'Session History', href: '/dashboard/staff/history' },
    { label: 'Analytics', href: '/dashboard/staff/analytics' },
  ],
  tutor: [
    { label: 'My Student', href: '/dashboard/tutor' },
    { label: 'Session History', href: '/dashboard/tutor/history' },
  ],
  student: [
    { label: 'My Tutor', href: '/dashboard/student' },
    { label: 'Class History', href: '/dashboard/student/history' },
  ],
};

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow px-4 py-2 flex gap-4">
        {navItems[role].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'text-gray-700 hover:text-blue-600 font-medium',
              'transition-colors duration-150'
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="ml-auto">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">Logout</button>
        </div>
      </nav>
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
