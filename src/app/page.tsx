'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail')
    if (savedEmail) setEmail(savedEmail)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data: any = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        if (remember) localStorage.setItem('rememberEmail', email)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-3xl font-bold">M</div>
          <h1 className="mt-6 text-4xl font-extrabold text-blue-900">MyScholar LMS</h1>
          <p className="mt-3 text-blue-800/80">Manage users, classes, and attendance with a streamlined, secure experience.</p>
          <ul className="mt-6 space-y-2 text-blue-900/80 text-sm">
            <li>• Role-based dashboards</li>
            <li>• Attendance & session tracking</li>
            <li>• Tutor and student workflows</li>
          </ul>
        </div>
      </div>
      <div className="flex-1 lg:max-w-lg w-full bg-white/90 backdrop-blur border-l border-blue-100 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center lg:hidden mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white text-2xl font-bold">M</div>
            <h2 className="mt-4 text-2xl font-extrabold text-blue-900">MyScholar</h2>
            <p className="text-sm text-blue-800/80">Educational Management System</p>
          </div>
          <form className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-blue-100" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input mt-1"
                  placeholder="you@myscholar.com"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value as string)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input pr-20"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value as string)}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 px-3 text-sm text-blue-700" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4" checked={remember} onChange={() => setRemember((v) => !v)} />
                  Remember me
                </label>
                <span className="text-sm text-blue-700">Forgot password?</span>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center text-xs text-blue-800/80">
              <p>Demo: admin@myscholar.com / admin123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
