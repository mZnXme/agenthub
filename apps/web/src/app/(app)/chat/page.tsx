'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsService } from '@/features/chat/infrastructure/sessions.service'

export default function ChatIndex() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function openFirstSession() {
      setError(null)
      try {
        const list = await sessionsService.list()
        if (cancelled) return
        if (list.length > 0) {
          router.replace(`/chat/${list[0].id}`)
          return
        }

        const session = await sessionsService.create()
        if (!cancelled && session.id) router.replace(`/chat/${session.id}`)
      } catch {
        if (!cancelled) setError('Could not start a chat session. Please try again.')
      }
    }

    openFirstSession()
    return () => { cancelled = true }
  }, [router, retryKey])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <section className="max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">Session unavailable</p>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-50">Chat could not start</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-6 rounded-full bg-neutral-100 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-300"
          >
            Retry
          </button>
        </section>
      </main>
    )
  }

  return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-500">Loading...</div>
}
