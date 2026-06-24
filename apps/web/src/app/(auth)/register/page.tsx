'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', name: '', password: '' })
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setError('Registration failed'); return }
    const { accessToken } = await res.json()
    localStorage.setItem('token', accessToken)
    router.push('/chat')
  }

  return (
    <div style={styles.page}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input style={styles.input} placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input style={styles.input} placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button style={styles.btn} type="submit">Register</button>
        <p style={styles.link}>Have an account? <a href="/login">Sign in</a></p>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { display: 'flex', flexDirection: 'column', gap: 12, width: 360, padding: 32, background: '#1a1a1a', borderRadius: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '10px 14px', borderRadius: 8, background: '#5865f2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 },
  error: { color: '#f87171', fontSize: 13 },
  link: { fontSize: 13, color: '#888', textAlign: 'center' },
}
