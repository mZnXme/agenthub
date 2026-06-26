'use client'

import { useState } from 'react'
import { useProviders } from '@/features/providers/application/use-providers'

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Google' },
  { id: 'custom', name: 'Custom endpoint' },
]

export default function ProvidersPage() {
  const { providers, saving, error, upsert, remove } = useProviders()
  const [form, setForm] = useState({ providerId: 'anthropic', apiKey: '', baseUrl: '', label: '' })

  async function save() {
    if (!form.apiKey.trim()) return
    await upsert({
      providerId: form.providerId,
      apiKey: form.apiKey,
      ...(form.label && { label: form.label }),
      ...(form.baseUrl && { baseUrl: form.baseUrl }),
    })
    setForm((current) => ({ ...current, apiKey: '', baseUrl: '', label: '' }))
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
        {error && <p style={s.error}>{error}</p>}
        {providers.length > 0 && (
          <div style={s.cardGrid}>
            {providers.map((provider) => (
              <div key={provider.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.providerName}>{PROVIDERS.find((x) => x.id === provider.providerId)?.name ?? provider.providerId}</span>
                  <span style={s.connected}>connected</span>
                </div>
                {provider.label && <div style={s.cardMeta}>{provider.label}</div>}
                <div style={s.cardMeta}>{provider.apiKeyMasked}</div>
                {provider.baseUrl && <div style={s.cardMeta}>{provider.baseUrl}</div>}
                <button style={s.removeBtn} onClick={() => remove(provider.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
        <div style={s.formBox}>
          <h3 style={s.subheading}>Add / Update provider</h3>
          <select style={s.input} value={form.providerId} onChange={(e) => setForm((current) => ({ ...current, providerId: e.target.value }))}>
            {PROVIDERS.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
          </select>
          <input style={s.input} type="password" placeholder="API key" value={form.apiKey} onChange={(e) => setForm((current) => ({ ...current, apiKey: e.target.value }))} />
          {form.providerId === 'custom' && (
            <input style={s.input} type="text" placeholder="Base URL (https://...)" value={form.baseUrl} onChange={(e) => setForm((current) => ({ ...current, baseUrl: e.target.value }))} />
          )}
          <input style={s.input} type="text" placeholder="Label (optional)" value={form.label} onChange={(e) => setForm((current) => ({ ...current, label: e.target.value }))} />
          <button style={s.saveBtn} onClick={save} disabled={saving || !form.apiKey.trim()}>{saving ? 'Saving...' : 'Save'}</button>
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
  error: { color: '#f87171', fontSize: 13, marginBottom: 16 },
}
