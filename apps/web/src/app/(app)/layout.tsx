'use client'

import { useAuthGuard } from '@/features/auth/application/use-auth-guard'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useAuthGuard()
  if (!ready) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#888', background: '#0a0a0a' }}>Loading…</div>
  return <>{children}</>
}
