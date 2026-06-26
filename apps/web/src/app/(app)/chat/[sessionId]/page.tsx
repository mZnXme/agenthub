'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { useChatSession } from '@/features/chat/application/use-chat-session'

export default function ChatPage() {
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()
  const chat = useChatSession(sessionId)

  return (
    <div className="chat-shell">
      <AppSidebar>
        <button className="nav-action primary" onClick={chat.newChat} disabled={chat.creating}>{chat.creating ? 'Creating...' : '+ New chat'}</button>
        <div className="stack" style={{ flex: 1, overflow: 'auto', marginTop: 8 }}>
          {chat.sessions.map((session) => (
            <div key={session.id} className={`nav-link${session.id === sessionId ? ' active' : ''}`} onClick={() => router.push(`/chat/${session.id}`)} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, cursor: 'pointer' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.title ?? 'New chat'}</span>
              <button className="btn ghost" style={{ padding: '0 4px', border: 'none' }} onClick={(event) => { event.stopPropagation(); chat.deleteSession(session.id) }}>x</button>
            </div>
          ))}
        </div>
        {chat.usage && (
          <div className="metric-strip" style={{ marginTop: 'auto' }}>
            <span>{chat.usage.plan.name}</span>
            {chat.usage.plan.maxMessagesPerDay !== -1 && <span>{chat.usage.record.messageCount}/{chat.usage.plan.maxMessagesPerDay} msg</span>}
            {chat.usage.plan.maxSessionsPerDay !== -1 && <span>{chat.usage.record.sessionCount}/{chat.usage.plan.maxSessionsPerDay} sessions</span>}
          </div>
        )}
      </AppSidebar>

      <main className="chat-main">
        <div className="chat-toolbar">
          <div>
            <div className="eyebrow">active session</div>
            <div className="panel-title">{chat.sessions.find((session) => session.id === sessionId)?.title ?? 'New chat'}</div>
          </div>
          <div className="chat-toolbar-controls">
            <span className="chat-label">Model</span>
            <select className="select" style={{ width: 320 }} value={chat.modelName} onChange={(event) => chat.selectModel(event.target.value)}>
              <option value="">OpenCode default</option>
              {chat.models.map((model) => <option key={model.id} value={model.id}>{model.id}</option>)}
            </select>
            <span className="chat-label">Effort</span>
            <select className="select" style={{ width: 132 }} value={chat.effort} onChange={(event) => chat.setEffort(event.target.value)}>
              <option value="auto">Auto</option>
              <option value="minimal">Minimal</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="max">Max</option>
            </select>
          </div>
        </div>

        {chat.limitMsg && (
          <div style={overlayStyle}>
            <div className="panel pad" style={{ maxWidth: 380 }}>
              <h2 className="panel-title">Action blocked</h2>
              <p className="panel-copy" style={{ marginTop: 8 }}>{chat.limitMsg}</p>
              <button className="btn primary" style={{ marginTop: 16 }} onClick={() => chat.setLimitMsg(null)}>Close</button>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {chat.messages.map((message, index) => <div key={index} className={`bubble ${message.role === 'user' ? 'user' : 'assistant'}`}>{message.content}</div>)}
          {chat.fileUpload.files.map((file) => <div key={file.id} className="pill on" style={{ alignSelf: 'flex-end' }}>{file.filename}</div>)}
          {chat.fileUpload.error && <div className="error" style={{ alignSelf: 'flex-end' }}>{chat.fileUpload.error}</div>}
          {chat.loading && <div className="bubble assistant" style={{ color: 'var(--dim)' }}>thinking...</div>}
          <div ref={chat.bottomRef} />
        </div>

        <div className="composer">
          {!chat.hasProvider && <div className="pill" style={{ position: 'absolute', left: 16, bottom: 72, color: 'var(--amber)' }}>Add an AI provider before sending messages.</div>}
          <label className="btn ghost">
            {chat.fileUpload.uploading ? 'Uploading...' : 'Attach'}
            <input type="file" style={{ display: 'none' }} onChange={(event) => { const file = event.target.files?.[0]; if (file) chat.attachFile(file).catch(() => null); event.currentTarget.value = '' }} />
          </label>
          <textarea className="textarea" value={chat.input} onChange={(event) => chat.setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); chat.send() } }} placeholder="Message AgentHub..." rows={1} />
          <button className="btn primary" onClick={chat.send} disabled={!chat.hasProvider || chat.loading}>Send</button>
        </div>
      </main>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.72)', display: 'grid', placeItems: 'center', zIndex: 50,
}
