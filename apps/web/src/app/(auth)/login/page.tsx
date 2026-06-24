'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setError('Invalid credentials'); return }
    const { accessToken } = await res.json()
    localStorage.setItem('token', accessToken)
    router.push('/chat')
  }

  return (
    <div style={styles.page}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>AgentHub</h1>
        <p style={styles.sub}>AI agent platform with MCP — in your browser</p>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input style={styles.input} placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button style={styles.btn} type="submit">Sign in</button>
        <p style={styles.link}>No account? <a href="/register">Register</a></p>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { display: 'flex', flexDirection: 'column', gap: 12, width: 360, padding: 32, background: '#1a1a1a', borderRadius: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  sub: { color: '#888', fontSize: 13, marginBottom: 8 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '10px 14px', borderRadius: 8, background: '#5865f2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 },
  error: { color: '#f87171', fontSize: 13 },
  link: { fontSize: 13, color: '#888', textAlign: 'center' },
}
