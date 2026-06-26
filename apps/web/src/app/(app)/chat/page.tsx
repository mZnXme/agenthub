'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { sessionsService, type Session } from '@/features/chat/infrastructure/sessions.service'
import { providersService } from '@/features/providers/infrastructure/providers.service'

export default function ChatIndex() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [hasProvider, setHasProvider] = useState(false)
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
        const [list, providers] = await Promise.all([sessionsService.list(), providersService.list()])
        if (cancelled) return
        setSessions(list)
        setHasProvider(providers.some((provider) => provider.connectedViaOpenCode || provider.apiKeyMasked))
        if (list.length > 0) router.replace(`/chat/${list[0].id}`)
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
    if (!hasProvider) {
      router.push('/providers')
      return
    }
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

  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="workspace" style={{ display: 'grid', placeItems: 'center' }}>
        <section className="panel pad stack" style={{ width: 'min(520px, 100%)', textAlign: 'center' }}>
          <p className="eyebrow">{error ? 'session unavailable' : loading ? 'loading workspace' : 'no chat selected'}</p>
          <h1 className="page-title" style={{ fontSize: 40 }}>{error ? 'Chat is unavailable' : loading ? 'Preparing AgentHub' : 'Start when you are ready'}</h1>
          <p className="page-copy" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {error ?? (loading ? 'Checking sessions and provider credentials.' : !hasProvider ? 'Connect an AI provider first, then enable the models you want in Settings.' : sessions.length === 0 ? 'Create a chat only when you need one. This keeps session quota under control.' : 'Choose an existing chat from the sidebar, or create a new one.')}
          </p>
          <button className="btn primary" onClick={error ? () => setRetryKey((value) => value + 1) : startChat} disabled={loading || creating}>{error ? 'Retry' : !hasProvider ? 'Set up provider' : creating ? 'Creating...' : 'New chat'}</button>
        </section>
      </main>
    </div>
  )
}
