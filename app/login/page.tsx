'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [isDemo, setIsDemo]     = useState(false)
  const router = useRouter()

  // Check demo mode and auto-login
  useEffect(() => {
    async function checkDemo() {
      try {
        const res = await fetch('/api/system/health')
        const data = await res.json()
        if (data.mode === 'demo') {
          setIsDemo(true)
          setLoading(true)
          const result = await signIn('credentials', {
            email: 'demo@brand.com',
            password: 'demo123',
            redirect: false,
          })
          if (result?.ok) {
            router.push('/dashboard/clienti')
          } else {
            setLoading(false)
          }
        }
      } catch {
        // Not in demo mode, show login form
      }
    }
    checkDemo()
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('Credenziali non valide')
      setLoading(false)
    } else {
      router.push('/dashboard/clienti')
    }
  }

  if (isDemo && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 animate-pulse">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Social Automation</h1>
          <p className="text-gray-400 text-sm">Accesso demo in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Social Automation</h1>
          <p className="text-gray-400 text-sm mt-1">Automazione contenuti</p>
        </div>
        <div className="card p-6">
          {isDemo && (
            <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
              <p className="text-sm text-brand-700 font-medium">Modalità Demo</p>
              <p className="text-xs text-brand-600 mt-1">
                Usa qualsiasi email e password per accedere
              </p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="admin" required autoComplete="username" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Accesso...' : 'Accedi'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
