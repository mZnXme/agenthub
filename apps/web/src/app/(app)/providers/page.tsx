'use client'

import { useState, useEffect } from 'react'
import { providersService, type Provider } from '@/features/providers/services/providers.service'

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Google' },
  { id: 'custom', name: 'Custom endpoint' },
]

export default function ProvidersPage() {
  const [list, setList] = useState<Provider[]>([])
  const [form, setForm] = useState({ providerId: 'anthropic', apiKey: '', baseUrl: '', label: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { providersService.list().then(setList) }, [])

  async function save() {
    if (!form.apiKey.trim()) return
    setSaving(true)
    await providersService.upsert({
      providerId: form.providerId, apiKey: form.apiKey,
      ...(form.label && { label: form.label }),
      ...(form.baseUrl && { baseUrl: form.baseUrl }),
    })
    setList(await providersService.list())
    setForm((f) => ({ ...f, apiKey: '', baseUrl: '', label: '' }))
    setSaving(false)
  }

  async function remove(id: string) {
    await providersService.remove(id)
    setList((l) => l.filter((p) => p.id !== id))
  }

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>AgentHub</div>
        <a href="/chat" style={s.navLink}>Chat</a>
        <a href="/mcp" style={s.navLink}>MCP Servers</a>
        <a href="/providers" style={{ ...s.navLink, ...s.navActive }}>AI Providers</a>
      </aside>
      <main style={s.main}>
        <h2 style={s.heading}>AI Providers</h2>

        {/* connected providers */}
        {list.length > 0 && (
          <div style={s.cardGrid}>
            {list.map((p) => (
              <div key={p.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.providerName}>{PROVIDERS.find((x) => x.id === p.providerId)?.name ?? p.providerId}</span>
                  <span style={s.connected}>connected</span>
                </div>
                {p.label && <div style={s.cardMeta}>{p.label}</div>}
                <div style={s.cardMeta}>{p.apiKeyMasked}</div>
                {p.baseUrl && <div style={s.cardMeta}>{p.baseUrl}</div>}
                <button style={s.removeBtn} onClick={() => remove(p.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {/* add / update form */}
        <div style={s.formBox}>
          <h3 style={s.subheading}>Add / Update provider</h3>
          <select style={s.input} value={form.providerId} onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}>
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input style={s.input} type="password" placeholder="API key" value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))} />
          {form.providerId === 'custom' && (
            <input style={s.input} type="text" placeholder="Base URL (https://...)" value={form.baseUrl}
              onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))} />
          )}
          <input style={s.input} type="text" placeholder="Label (optional)" value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <button style={s.saveBtn} onClick={save} disabled={saving || !form.apiKey.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', height: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: 'system-ui, sans-serif' },
  sidebar: { width: 220, background: '#111', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  logo: { fontWeight: 700, fontSize: 18, marginBottom: 12 },
  navLink: { color: '#aaa', textDecoration: 'none', fontSize: 14, padding: '6px 8px', borderRadius: 6 },
  navActive: { background: '#1e1e2e', color: '#fff' },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
  heading: { margin: '0 0 24px', fontSize: 22, fontWeight: 700 },
  subheading: { margin: '0 0 16px', fontSize: 16, fontWeight: 600 },
  cardGrid: { display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  card: { background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 12, padding: 16, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  providerName: { fontWeight: 600, fontSize: 15 },
  connected: { fontSize: 11, background: '#1a3a1a', color: '#4caf50', padding: '2px 8px', borderRadius: 99, border: '1px solid #2e5c2e' },
  cardMeta: { fontSize: 12, color: '#888' },
  removeBtn: { marginTop: 4, padding: '6px 12px', background: 'none', border: '1px solid #3a1a1a', color: '#e57373', borderRadius: 6, cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' },
  formBox: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#0a0a0a', color: '#f0f0f0', fontSize: 14 },
  saveBtn: { padding: '10px 20px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
}
