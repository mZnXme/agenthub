'use client'

import { useParams, useRouter } from 'next/navigation'
import { useChatSession } from '@/features/chat/application/use-chat-session'

export default function ChatPage() {
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()
  const chat = useChatSession(sessionId)

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>AgentHub</div>
        <a href="/mcp" style={s.navLink}>MCP Servers</a>
        <a href="/providers" style={s.navLink}>AI Providers</a>
        <a href="/settings" style={s.navLink}>Settings</a>
        <button style={{ ...s.newBtn, ...(chat.creating ? s.disabledBtn : {}) }} onClick={chat.newChat} disabled={chat.creating}>
          {chat.creating ? 'Creating...' : '+ New chat'}
        </button>
        <div style={s.sessionList}>
          {chat.sessions.map((session) => (
            <div key={session.id} style={{ ...s.sessionItem, ...(session.id === sessionId ? s.sessionActive : {}) }} onClick={() => router.push(`/chat/${session.id}`)}>
              <span style={s.sessionTitle}>{session.title ?? 'New chat'}</span>
              <button style={s.deleteBtn} onClick={(event) => { event.stopPropagation(); chat.deleteSession(session.id) }}>×</button>
            </div>
          ))}
        </div>
        {chat.usage && (
          <div style={s.usageBox}>
            <div style={s.usagePlan}>{chat.usage.plan.name}</div>
            {chat.usage.plan.maxMessagesPerDay !== -1 && <div style={s.usageLine}>{chat.usage.record.messageCount} / {chat.usage.plan.maxMessagesPerDay} msg</div>}
            {chat.usage.plan.maxSessionsPerDay !== -1 && <div style={s.usageLine}>{chat.usage.record.sessionCount} / {chat.usage.plan.maxSessionsPerDay} sessions</div>}
          </div>
        )}
      </aside>
      <main style={s.main}>
        <div style={s.modelBar}>
          <div style={s.modelControl}>
            <span style={s.modelLabel}>Model</span>
            <select style={s.modelSelect} value={chat.modelConfigId} onChange={(event) => chat.selectModel(event.target.value)}>
              <option value="">OpenCode default</option>
              {chat.models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </div>
          <div style={s.modelControl}>
            <span style={s.modelLabel}>Effort</span>
            <select style={s.effortSelect} value={chat.effort} onChange={(event) => chat.setEffort(event.target.value)}>
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
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h2 style={{ marginBottom: 8 }}>Limit reached</h2>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{chat.limitMsg}</p>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>Upgrade to Pro for unlimited messages, sessions, and larger uploads.</p>
              <button style={s.modalClose} onClick={() => chat.setLimitMsg(null)}>Close</button>
            </div>
          </div>
        )}
        <div style={s.messages}>
          {chat.messages.map((message, index) => (
            <div key={index} style={{ ...s.bubble, ...(message.role === 'user' ? s.user : s.assistant) }}>{message.content}</div>
          ))}
          {chat.fileUpload.files.map((file) => <div key={file.id} style={s.fileChip}>{file.filename}</div>)}
          {chat.fileUpload.error && <div style={s.uploadError}>{chat.fileUpload.error}</div>}
          {chat.loading && <div style={{ ...s.bubble, ...s.assistant, color: '#888' }}>thinking...</div>}
          <div ref={chat.bottomRef} />
        </div>
        <div style={s.inputRow}>
          {!chat.hasProvider && <div style={s.providerNotice}>Add an AI provider before sending messages.</div>}
          <label style={s.attachBtn}>
            {chat.fileUpload.uploading ? 'Uploading...' : 'Attach'}
            <input type="file" style={{ display: 'none' }} onChange={(event) => { const file = event.target.files?.[0]; if (file) chat.attachFile(file).catch(() => null); event.currentTarget.value = '' }} />
          </label>
          <textarea
            style={s.textarea}
            value={chat.input}
            onChange={(event) => chat.setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); chat.send() } }}
            placeholder="Message AgentHub..."
            rows={1}
          />
          <button style={{ ...s.sendBtn, ...(!chat.hasProvider || chat.loading ? s.disabledBtn : {}) }} onClick={chat.send} disabled={!chat.hasProvider || chat.loading}>Send</button>
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
  disabledBtn: { opacity: 0.6, cursor: 'not-allowed' },
  sessionList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 },
  sessionItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', color: '#aaa', fontSize: 13 },
  sessionActive: { background: '#1e1e2e', color: '#fff' },
  sessionTitle: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  deleteBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: '0 2px', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  modelBar: { padding: '12px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', background: '#0d0d0d' },
  modelControl: { display: 'flex', alignItems: 'center', gap: 8 },
  modelLabel: { color: '#777', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' },
  modelSelect: { maxWidth: 320, padding: '7px 10px', borderRadius: 9, border: '1px solid #333', background: '#151515', color: '#f0f0f0', fontSize: 13 },
  effortSelect: { padding: '7px 10px', borderRadius: 9, border: '1px solid #333', background: '#151515', color: '#f0f0f0', fontSize: 13 },
  messages: { flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  bubble: { maxWidth: 720, padding: '10px 14px', borderRadius: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: 14 },
  user: { background: '#5865f2', alignSelf: 'flex-end' },
  assistant: { background: '#1e1e1e', alignSelf: 'flex-start' },
  inputRow: { padding: 16, display: 'flex', gap: 8, borderTop: '1px solid #1e1e1e', position: 'relative' },
  providerNotice: { position: 'absolute', left: 16, bottom: 62, color: '#fbbf24', fontSize: 12, background: '#1c1917', border: '1px solid #78350f', borderRadius: 999, padding: '5px 10px' },
  textarea: { flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #333', background: '#111', color: '#f0f0f0', fontSize: 14, resize: 'none' },
  attachBtn: { padding: '10px 14px', border: '1px solid #333', color: '#ddd', background: '#161616', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  sendBtn: { padding: '10px 20px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 },
  fileChip: { alignSelf: 'flex-end', border: '1px solid #384152', background: '#111827', color: '#bfdbfe', borderRadius: 999, padding: '6px 12px', fontSize: 12 },
  uploadError: { alignSelf: 'flex-end', color: '#f87171', fontSize: 12 },
  usageBox: { marginTop: 'auto', padding: '10px 8px', borderTop: '1px solid #222', fontSize: 12, color: '#666' },
  usagePlan: { fontWeight: 600, color: '#888', marginBottom: 4 },
  usageLine: { color: '#555', lineHeight: 1.8 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#1a1a1a', borderRadius: 12, padding: 28, maxWidth: 360, width: '90%', border: '1px solid #333' },
  modalClose: { padding: '8px 20px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
}
