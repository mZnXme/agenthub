'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login')
  }, [])
  return <>{children}</>
}
