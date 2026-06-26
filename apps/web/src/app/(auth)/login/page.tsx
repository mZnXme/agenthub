'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      const token = await signInWithGoogle()
      localStorage.setItem('token', token)
      router.push('/chat')
    } catch (e) {
      console.error('[Google Sign-In Error]', e)
      const msg = e instanceof Error ? e.message : String(e)
      setError(`Sign in failed: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="panel pad auth-card stack">
        <p className="eyebrow">agent workspace</p>
        <h1 className="page-title" style={{ fontSize: 44 }}>AgentHub</h1>
        <p className="page-copy">A browser console for OpenCode sessions, provider auth, model routing, MCP tools, and skills.</p>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" onClick={handleGoogle} disabled={loading}>{loading ? 'Signing in...' : 'Continue with Google'}</button>
      </section>
    </main>
  )
}
