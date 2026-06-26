'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsService, type Session } from '@/features/chat/infrastructure/sessions.service'

export default function ChatIndex() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadSessions() {
      setLoading(true)
      setError(null)
      try {
        const list = await sessionsService.list()
        if (cancelled) return
        setSessions(list)
        if (list.length > 0) {
          router.replace(`/chat/${list[0].id}`)
          return
        }
      } catch {
        if (!cancelled) setError('Could not load your chat sessions. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSessions()
    return () => { cancelled = true }
  }, [router, retryKey])

  async function startChat() {
    if (creating) return
    setCreating(true)
    setError(null)
    try {
      const session = await sessionsService.create()
      router.push(`/chat/${session.id}`)
    } catch {
      setError('Could not create a chat session. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <section className="max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">Session unavailable</p>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-50">Chat is unavailable</h1>
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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-500">Loading...</div>

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <section className="max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">No chat selected</p>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-50">Start when you are ready</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          {sessions.length === 0
            ? 'Create a chat only when you need one. This keeps your session quota under control.'
            : 'Choose an existing chat from the sidebar, or create a new one.'}
        </p>
        <button
          type="button"
          onClick={startChat}
          disabled={creating}
          className="mt-6 rounded-full bg-neutral-100 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'New chat'}
        </button>
      </section>
    </main>
  )
}
