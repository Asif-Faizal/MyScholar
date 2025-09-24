"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

interface DashboardLayoutProps {
  role: 'admin' | 'staff' | 'tutor' | 'student';
  children: React.ReactNode;
}

interface LoggedInUser {
  user_id: number;
  alias: string;
  email: string;
  role: string;
}

const navItems: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: 'Overview', href: '/dashboard/admin' },
    { label: 'Users', href: '/dashboard/admin/users' },
    { label: 'Mappings', href: '/dashboard/admin/mappings' },
    { label: 'Attendance', href: '/dashboard/admin/attendance' },
  ],
  staff: [
    { label: 'Overview', href: '/dashboard/staff' },
    { label: 'Users', href: '/dashboard/staff/users' },
    { label: 'Mappings', href: '/dashboard/staff/mappings' },
    { label: 'Attendance', href: '/dashboard/staff/attendance' },
  ],
  tutor: [
    { label: 'Overview', href: '/dashboard/tutor' },
    { label: 'Classes', href: '/dashboard/tutor/classes' },
  ],
  student: [
    { label: 'Overview', href: '/dashboard/student' },
    { label: 'Classes', href: '/dashboard/student/classes' },
  ],
};

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!token || !userData) {
        router.push('/');
        return;
      }
      setUser(JSON.parse(userData));
    } catch (_) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Sidebar (mobile overlay) */}
      <div
        className={clsx(
          'hidden fixed inset-0 bg-black/30 z-30 md:hidden',
          isSidebarOpen && 'block'
        )}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200',
          '-translate-x-full md:translate-x-0 md:static md:z-auto',
          isSidebarOpen && 'translate-x-0 shadow-xl'
        )}
      >
        <div className="px-4 py-4 text-blue-50 font-bold text-lg border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
          <span>MyScholar</span>
          <button className="md:hidden text-sm text-white/90" onClick={() => setIsSidebarOpen(false)}>Close</button>
        </div>
        <div className="p-3 space-y-1">
          {navItems[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors',
                pathname.startsWith(item.href) && 'bg-blue-100 text-blue-800 font-semibold'
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto p-3">
          <button className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 shadow-sm" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden px-4 py-2 rounded-md font-medium transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300" onClick={() => setIsSidebarOpen(true)}>Menu</button>
            <h1 className="truncate font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[200px]">{user.alias}</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 uppercase">{user.role}</span>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
