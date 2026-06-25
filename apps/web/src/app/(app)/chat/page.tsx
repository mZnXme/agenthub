'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatIndex() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const api = process.env.NEXT_PUBLIC_API_URL
    const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    fetch(`${api}/api/sessions`, { headers: h })
      .then((r) => r.json())
      .then((list: { id: string }[]) => {
        if (list.length > 0) return router.replace(`/chat/${list[0].id}`)
        return fetch(`${api}/api/sessions`, { method: 'POST', headers: h, body: '{}' })
          .then((r) => { if (!r.ok) throw new Error('Failed to create session'); return r.json() })
          .then((s: { id: string }) => { if (s.id) router.replace(`/chat/${s.id}`) })
      })
  }, [])

  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888', background: '#0a0a0a' }}>Loading…</div>
}
