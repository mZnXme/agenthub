'use client'

import { useEffect, useState } from 'react'
import { useProviders } from '@/features/providers/application/use-providers'

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    eyebrow: 'ChatGPT Pro / Plus',
    note: 'Connect with a device code. No API key is stored in AgentHub.',
    connectLabel: 'Connect ChatGPT',
    primary: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    eyebrow: 'Claude',
    note: 'Browser connect depends on OpenCode support. Manual key is available for now.',
    connectLabel: 'Use API key',
    primary: false,
  },
  {
    id: 'google',
    name: 'Google',
    eyebrow: 'Gemini',
    note: 'Use an AI Studio key until OpenCode exposes a browser flow for Google.',
    connectLabel: 'Use API key',
    primary: false,
  },
]

const MANUAL_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', keyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'google', name: 'Google', keyUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'custom', name: 'Custom endpoint', keyUrl: '' },
]

export default function ProvidersPage() {
  const { providers, saving, connecting, connectState, error, upsert, remove, connect, checkConnect } = useProviders()
  const [manualOpen, setManualOpen] = useState(false)
  const [form, setForm] = useState({ providerId: 'anthropic', apiKey: '', baseUrl: '', label: '' })
  const selectedManualProvider = MANUAL_PROVIDERS.find((provider) => provider.id === form.providerId) ?? MANUAL_PROVIDERS[0]

  useEffect(() => {
    if (!connectState || !['starting', 'waiting'].includes(connectState.status)) return
    const timer = setInterval(() => { void checkConnect(connectState.providerId) }, 2_500)
    return () => clearInterval(timer)
  }, [checkConnect, connectState])

  async function beginConnect(providerId: string) {
    if (providerId !== 'openai') {
      setManualOpen(true)
      setForm((current) => ({ ...current, providerId }))
      return
    }
    const state = await connect(providerId)
    if (state.url) window.open(state.url, '_blank', 'noopener,noreferrer')
  }

  async function saveManual() {
    if (!form.apiKey.trim()) return
    await upsert({
      providerId: form.providerId,
      apiKey: form.apiKey,
      ...(form.label && { label: form.label }),
      ...(form.baseUrl && { baseUrl: form.baseUrl }),
    })
    setForm((current) => ({ ...current, apiKey: '', baseUrl: '', label: '' }))
    setManualOpen(false)
  }

  function providerStatus(providerId: string) {
    const provider = providers.find((item) => item.providerId === providerId)
    if (provider?.connectedViaOpenCode) return 'Connected by OpenCode'
    if (provider?.apiKeyMasked) return 'Connected by API key'
    return 'Not connected'
  }

  function connectedProvider(providerId: string) {
    const provider = providers.find((item) => item.providerId === providerId)
    return Boolean(provider?.connectedViaOpenCode || provider?.apiKeyMasked)
  }

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>AgentHub</div>
        <a href="/chat" style={s.navLink}>Chat</a>
        <a href="/mcp" style={s.navLink}>MCP Servers</a>
        <a href="/providers" style={{ ...s.navLink, ...s.navActive }}>AI Providers</a>
        <a href="/settings" style={s.navLink}>Settings</a>
      </aside>
      <main style={s.main}>
        <section style={s.hero}>
          <div>
            <p style={s.kicker}>Provider access</p>
            <h1 style={s.heading}>Connect once. Choose model in chat.</h1>
            <p style={s.intro}>Use the OpenCode-style device flow when available. Manual API keys stay tucked away as a fallback for providers that need them.</p>
          </div>
        </section>

        {error && <p style={s.error}>{error}</p>}

        {connectState && ['starting', 'waiting', 'connected', 'failed'].includes(connectState.status) && (
          <section style={s.deviceBox}>
            <div>
              <p style={s.deviceLabel}>OpenCode connect</p>
              <h2 style={s.deviceTitle}>{connectState.status === 'connected' ? 'Connected' : connectState.status === 'failed' ? 'Connection needs attention' : 'Authorize in your browser'}</h2>
              {connectState.error && <p style={s.deviceText}>{connectState.error}</p>}
              {!connectState.error && connectState.status !== 'connected' && <p style={s.deviceText}>Open the auth page, enter the code, then return here. AgentHub will detect the completed OpenCode credential automatically.</p>}
            </div>
            {connectState.code && <div style={s.codeBox}>{connectState.code}</div>}
            {connectState.url && <a style={s.authLink} href={connectState.url} target="_blank" rel="noreferrer">Open auth page</a>}
          </section>
        )}

        <section style={s.providerGrid}>
          {PROVIDERS.map((provider) => {
            const isConnected = connectedProvider(provider.id)
            return (
              <article key={provider.id} style={{ ...s.providerCard, ...(isConnected ? s.providerCardConnected : {}) }}>
                <div style={s.providerTop}>
                  <span style={s.eyebrow}>{provider.eyebrow}</span>
                  <span style={{ ...s.statusPill, ...(isConnected ? s.statusOn : {}) }}>{providerStatus(provider.id)}</span>
                </div>
                <h2 style={s.providerName}>{provider.name}</h2>
                <p style={s.providerNote}>{provider.note}</p>
                <button
                  style={{ ...s.connectBtn, ...(provider.primary ? s.primaryBtn : s.secondaryBtn) }}
                  onClick={() => beginConnect(provider.id)}
                  disabled={connecting === provider.id}
                >
                  {connecting === provider.id ? 'Starting...' : provider.connectLabel}
                </button>
              </article>
            )
          })}
        </section>

        {providers.filter((provider) => provider.apiKeyMasked).length > 0 && (
          <section style={s.savedKeys}>
            <p style={s.savedTitle}>Manual keys</p>
            {providers.filter((provider) => provider.apiKeyMasked).map((provider) => (
              <div key={provider.id} style={s.savedRow}>
                <span>{MANUAL_PROVIDERS.find((item) => item.id === provider.providerId)?.name ?? provider.providerId}</span>
                <span style={s.savedMeta}>{provider.label || provider.apiKeyMasked}</span>
                {!provider.id.startsWith('opencode-') && <button style={s.removeBtn} onClick={() => remove(provider.id)}>Remove</button>}
              </div>
            ))}
          </section>
        )}

        <section style={s.manualShell}>
          <button style={s.manualToggle} onClick={() => setManualOpen((value) => !value)}>
            {manualOpen ? 'Hide manual API key setup' : 'Use API key manually'}
          </button>
          {manualOpen && (
            <div style={s.manualBox}>
              <select style={s.input} value={form.providerId} onChange={(event) => setForm((current) => ({ ...current, providerId: event.target.value }))}>
                {MANUAL_PROVIDERS.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
              </select>
              {selectedManualProvider.keyUrl && <a style={s.smallLink} href={selectedManualProvider.keyUrl} target="_blank" rel="noreferrer">Get API key</a>}
              <input style={s.input} type="password" placeholder="API key" value={form.apiKey} onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))} />
              {form.providerId === 'custom' && <input style={s.input} type="text" placeholder="Base URL (https://...)" value={form.baseUrl} onChange={(event) => setForm((current) => ({ ...current, baseUrl: event.target.value }))} />}
              <input style={s.input} type="text" placeholder="Label (optional)" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
              <button style={s.saveBtn} onClick={saveManual} disabled={saving || !form.apiKey.trim()}>{saving ? 'Saving...' : 'Save manual key'}</button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', minHeight: '100vh', background: 'oklch(0.145 0.01 265)', color: 'oklch(0.94 0.006 265)', fontFamily: 'system-ui, sans-serif' },
  sidebar: { width: 220, background: 'oklch(0.18 0.008 265)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, borderRight: '1px solid oklch(0.26 0.012 265)' },
  logo: { fontWeight: 750, fontSize: 18, marginBottom: 12 },
  navLink: { color: 'oklch(0.73 0.012 265)', textDecoration: 'none', fontSize: 14, padding: '6px 8px', borderRadius: 8 },
  navActive: { background: 'oklch(0.25 0.03 265)', color: 'oklch(0.96 0.006 265)' },
  main: { flex: 1, padding: '40px clamp(20px, 4vw, 56px)', overflowY: 'auto' },
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 28, alignItems: 'end', marginBottom: 28 },
  kicker: { margin: '0 0 10px', color: 'oklch(0.72 0.12 250)', fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' },
  heading: { margin: 0, maxWidth: 680, fontSize: 'clamp(34px, 5vw, 64px)', lineHeight: 0.95, letterSpacing: '-0.055em', fontWeight: 850 },
  intro: { margin: '18px 0 0', maxWidth: 620, color: 'oklch(0.74 0.015 265)', fontSize: 15, lineHeight: 1.65 },
  providerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 22 },
  providerCard: { minHeight: 240, background: 'oklch(0.18 0.01 265)', border: '1px solid oklch(0.28 0.015 265)', borderRadius: 26, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 },
  providerCardConnected: { borderColor: 'oklch(0.61 0.16 155)', background: 'linear-gradient(180deg, oklch(0.21 0.032 155), oklch(0.18 0.01 265))' },
  providerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  eyebrow: { color: 'oklch(0.71 0.016 265)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' },
  statusPill: { color: 'oklch(0.68 0.015 265)', border: '1px solid oklch(0.31 0.015 265)', borderRadius: 999, padding: '4px 9px', fontSize: 11, whiteSpace: 'nowrap' },
  statusOn: { color: 'oklch(0.78 0.16 155)', borderColor: 'oklch(0.55 0.14 155)' },
  providerName: { margin: '6px 0 0', fontSize: 30, lineHeight: 1, letterSpacing: '-0.04em' },
  providerNote: { margin: 0, color: 'oklch(0.72 0.016 265)', fontSize: 14, lineHeight: 1.6, flex: 1 },
  connectBtn: { width: '100%', padding: '12px 16px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 14 },
  primaryBtn: { background: 'oklch(0.66 0.18 250)', color: 'oklch(0.985 0.005 250)', border: '1px solid oklch(0.7 0.18 250)' },
  secondaryBtn: { background: 'transparent', color: 'oklch(0.86 0.02 265)', border: '1px solid oklch(0.38 0.018 265)' },
  deviceBox: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', gap: 16, alignItems: 'center', background: 'oklch(0.2 0.018 250)', border: '1px solid oklch(0.38 0.08 250)', borderRadius: 22, padding: 18, marginBottom: 20 },
  deviceLabel: { margin: '0 0 4px', color: 'oklch(0.73 0.12 250)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' },
  deviceTitle: { margin: 0, fontSize: 20, letterSpacing: '-0.025em' },
  deviceText: { margin: '8px 0 0', color: 'oklch(0.74 0.015 265)', fontSize: 13, lineHeight: 1.55 },
  codeBox: { fontSize: 24, letterSpacing: '0.08em', fontWeight: 850, padding: '12px 16px', borderRadius: 14, background: 'oklch(0.12 0.012 250)', border: '1px solid oklch(0.42 0.09 250)' },
  authLink: { color: 'oklch(0.94 0.006 250)', background: 'oklch(0.55 0.15 250)', borderRadius: 14, padding: '12px 16px', textDecoration: 'none', fontWeight: 800, whiteSpace: 'nowrap' },
  savedKeys: { marginTop: 22, border: '1px solid oklch(0.28 0.015 265)', borderRadius: 20, padding: 16, background: 'oklch(0.17 0.009 265)' },
  savedTitle: { margin: '0 0 10px', color: 'oklch(0.72 0.016 265)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' },
  savedRow: { display: 'grid', gridTemplateColumns: '160px 1fr auto', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: '1px solid oklch(0.25 0.012 265)', fontSize: 13 },
  savedMeta: { color: 'oklch(0.64 0.014 265)' },
  removeBtn: { padding: '6px 10px', borderRadius: 10, border: '1px solid oklch(0.45 0.11 25)', background: 'transparent', color: 'oklch(0.72 0.13 25)', cursor: 'pointer' },
  manualShell: { marginTop: 18 },
  manualToggle: { background: 'transparent', color: 'oklch(0.72 0.016 265)', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },
  manualBox: { marginTop: 12, background: 'oklch(0.17 0.009 265)', border: '1px solid oklch(0.26 0.012 265)', borderRadius: 18, padding: 16, maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: '11px 12px', borderRadius: 12, border: '1px solid oklch(0.33 0.016 265)', background: 'oklch(0.13 0.01 265)', color: 'oklch(0.94 0.006 265)', fontSize: 14 },
  smallLink: { color: 'oklch(0.76 0.12 250)', fontSize: 13, textDecoration: 'none', alignSelf: 'flex-start' },
  saveBtn: { padding: '11px 16px', background: 'oklch(0.58 0.17 250)', color: 'oklch(0.98 0.005 250)', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 800 },
  error: { color: 'oklch(0.74 0.14 25)', fontSize: 13, marginBottom: 16 },
}
