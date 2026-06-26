'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'

export function useAuthGuard() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, async (user) => {
      if (!user && !localStorage.getItem('token')) {
        router.replace('/login')
        return
      }
      if (user) localStorage.setItem('token', await user.getIdToken())
      setReady(true)
    })
  }, [router])

  return { ready }
}
