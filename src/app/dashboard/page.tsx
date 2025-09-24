"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.replace('/')
      return
    }
    try {
      const user = JSON.parse(userData)
      const role: string = (user?.role || '').toLowerCase()
      if (role === 'admin') router.replace('/dashboard/admin')
      else if (role === 'staff') router.replace('/dashboard/staff')
      else if (role === 'tutor' || role === 'teacher') router.replace('/dashboard/tutor')
      else router.replace('/dashboard/student')
    } catch {
      router.replace('/')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Loading dashboard…</div>
    </div>
  )
}
