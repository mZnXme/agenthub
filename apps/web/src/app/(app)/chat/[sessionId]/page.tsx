'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { sessionsService, type Session } from '@/features/chat/services/sessions.service'
import { messagesService, type Message } from '@/features/chat/services/messages.service'
import { streamEvents } from '@/features/chat/services/events.service'
import { usageService, type UsageData } from '@/features/usage/services/usage.service'

export default function ChatPage() {
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()
  const [sessions, setSessions] = useState<Session[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [limitMsg, setLimitMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sessionsService.list().then(setSessions)
    usageService.get().then(setUsage).catch(() => null)
  }, [])

  useEffect(() => {
    if (!sessionId) return
    setMessages([])
    messagesService.list(sessionId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
  }, [sessionId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function newChat() {
    try {
      const s = await sessionsService.create()
      setSessions((prev) => [s, ...prev])
      router.push(`/chat/${s.id}`)
    } catch (e: any) {
      setLimitMsg(e?.message ?? 'Session limit reached')
    }
  }

  async function deleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await sessionsService.remove(id)
    const remaining = sessions.filter((s) => s.id !== id)
    setSessions(remaining)
    if (id === sessionId) {
      if (remaining.length > 0) router.push(`/chat/${remaining[0].id}`)
      else newChat()
    }
  }

  async function send() {
    if (!input.trim() || !sessionId || loading) return
    const content = input
    setMessages((m) => [...m, { role: 'user', content }])
    setInput('')
    setLoading(true)
    try {
      messagesService.send(sessionId, content)
      setMessages((m) => [...m, { role: 'assistant', content: '' }])
      await streamEvents(sessionId, (text) =>
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + text }
          return copy
        })
      )
    } catch (e: any) {
      setLimitMsg(e?.message ?? 'Message limit reached')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>AgentHub</div>
        <a href="/mcp" style={s.navLink}>MCP Servers</a>
        <a href="/providers" style={s.navLink}>AI Providers</a>
        <button style={s.newBtn} onClick={newChat}>+ New chat</button>
        <div style={s.sessionList}>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              style={{ ...s.sessionItem, ...(sess.id === sessionId ? s.sessionActive : {}) }}
              onClick={() => router.push(`/chat/${sess.id}`)}
            >
              <span style={s.sessionTitle}>{sess.title ?? 'New chat'}</span>
              <button style={s.deleteBtn} onClick={(e) => deleteSession(e, sess.id)}>×</button>
            </div>
          ))}
        </div>
        {usage && (
          <div style={s.usageBox}>
            <div style={s.usagePlan}>{usage.plan.name}</div>
            {usage.plan.maxMessagesPerDay !== -1 && (
              <div style={s.usageLine}>
                {usage.record.messageCount} / {usage.plan.maxMessagesPerDay} msg
              </div>
            )}
            {usage.plan.maxSessionsPerDay !== -1 && (
              <div style={s.usageLine}>
                {usage.record.sessionCount} / {usage.plan.maxSessionsPerDay} sessions
              </div>
            )}
          </div>
        )}
      </aside>
      <main style={s.main}>
        {limitMsg && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h2 style={{ marginBottom: 8 }}>Limit reached</h2>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{limitMsg}</p>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>Upgrade to Pro for unlimited messages and sessions.</p>
              <button style={s.modalClose} onClick={() => setLimitMsg(null)}>Close</button>
            </div>
          </div>
        )}
        <div style={s.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...s.bubble, ...(m.role === 'user' ? s.user : s.assistant) }}>
              {m.content}
            </div>
          ))}
          {loading && <div style={{ ...s.bubble, ...s.assistant, color: '#888' }}>thinking…</div>}
          <div ref={bottomRef} />
        </div>
        <div style={s.inputRow}>
          <textarea style={s.textarea} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Message AgentHub…" rows={1} />
          <button style={s.sendBtn} onClick={send} disabled={loading}>Send</button>
        </div>
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', height: '100vh' },
  sidebar: { width: 220, background: '#111', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  logo: { fontWeight: 700, fontSize: 18, marginBottom: 12 },
  navLink: { color: '#aaa', textDecoration: 'none', fontSize: 14, padding: '6px 8px', borderRadius: 6 },
  newBtn: { padding: '8px 12px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
  sessionList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 },
  sessionItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', color: '#aaa', fontSize: 13 },
  sessionActive: { background: '#1e1e2e', color: '#fff' },
  sessionTitle: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  deleteBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: '0 2px', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  messages: { flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  bubble: { maxWidth: 720, padding: '10px 14px', borderRadius: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: 14 },
  user: { background: '#5865f2', alignSelf: 'flex-end' },
  assistant: { background: '#1e1e1e', alignSelf: 'flex-start' },
  inputRow: { padding: 16, display: 'flex', gap: 8, borderTop: '1px solid #1e1e1e' },
  textarea: { flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #333', background: '#111', color: '#f0f0f0', fontSize: 14, resize: 'none' },
  sendBtn: { padding: '10px 20px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 },
  usageBox: { marginTop: 'auto', padding: '10px 8px', borderTop: '1px solid #222', fontSize: 12, color: '#666' },
  usagePlan: { fontWeight: 600, color: '#888', marginBottom: 4 },
  usageLine: { color: '#555', lineHeight: 1.8 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#1a1a1a', borderRadius: 12, padding: 28, maxWidth: 360, width: '90%', border: '1px solid #333' },
  modalClose: { padding: '8px 20px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
}
