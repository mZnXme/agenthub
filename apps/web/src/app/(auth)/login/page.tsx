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
    } catch {
      setError('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>AgentHub</h1>
        <p style={styles.sub}>AI agent platform with MCP — in your browser</p>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} onClick={handleGoogle} disabled={loading}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { display: 'flex', flexDirection: 'column', gap: 16, width: 360, padding: 32, background: '#1a1a1a', borderRadius: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  sub: { color: '#888', fontSize: 13, marginBottom: 8 },
  btn: { padding: '10px 14px', borderRadius: 8, background: '#4285f4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15 },
  error: { color: '#f87171', fontSize: 13 },
}
