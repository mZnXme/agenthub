'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { useProviders } from '@/features/providers/application/use-providers'

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', eyebrow: 'ChatGPT Pro / Plus', note: 'Device-code auth through OpenCode. Best path when you use ChatGPT plans.', connectLabel: 'Connect ChatGPT', primary: true },
  { id: 'anthropic', name: 'Anthropic', eyebrow: 'Claude', note: 'Manual key fallback until OpenCode exposes a stable headless Claude auth label.', connectLabel: 'Use API key', primary: false },
  { id: 'google', name: 'Google', eyebrow: 'Gemini', note: 'Connect with an AI Studio key and enable Gemini models in Settings.', connectLabel: 'Use API key', primary: false },
]

const MANUAL_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', keyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'google', name: 'Google', keyUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'custom', name: 'Custom endpoint', keyUrl: '' },
]

export default function ProvidersPage() {
  const router = useRouter()
  const { providers, saving, connecting, connectState, error, upsert, remove, connect, checkConnect } = useProviders()
  const [manualOpen, setManualOpen] = useState(false)
  const [form, setForm] = useState({ providerId: 'anthropic', apiKey: '', baseUrl: '', label: '' })
  const selectedManualProvider = MANUAL_PROVIDERS.find((provider) => provider.id === form.providerId) ?? MANUAL_PROVIDERS[0]

  useEffect(() => {
    if (!connectState || !['starting', 'waiting'].includes(connectState.status)) return
    const timer = setInterval(() => { void checkConnect(connectState.providerId) }, 2_500)
    return () => clearInterval(timer)
  }, [checkConnect, connectState])

  useEffect(() => {
    if (connectState?.status !== 'connected') return
    const timer = setTimeout(() => router.push('/settings'), 1_200)
    return () => clearTimeout(timer)
  }, [connectState?.status, router])

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
    await upsert({ providerId: form.providerId, apiKey: form.apiKey, ...(form.label && { label: form.label }), ...(form.baseUrl && { baseUrl: form.baseUrl }) })
    setForm((current) => ({ ...current, apiKey: '', baseUrl: '', label: '' }))
    setManualOpen(false)
    router.push('/settings')
  }

  function providerStatus(providerId: string) {
    const provider = providers.find((item) => item.providerId === providerId)
    if (provider?.connectedViaOpenCode) return 'OpenCode credential'
    if (provider?.apiKeyMasked) return 'Manual key'
    return 'Not connected'
  }

  function connectedProvider(providerId: string) {
    const provider = providers.find((item) => item.providerId === providerId)
    return Boolean(provider?.connectedViaOpenCode || provider?.apiKeyMasked)
  }

  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="workspace">
        <div className="page-grid">
          <section className="hero-row">
            <div>
              <p className="eyebrow">provider access</p>
              <h1 className="page-title">Connect credentials without turning the console into a key vault.</h1>
              <p className="page-copy">OpenCode auth is the primary route. Manual API keys remain available for providers that still need them.</p>
            </div>
            <div className="metric-strip"><span>{providers.filter((provider) => provider.connectedViaOpenCode || provider.apiKeyMasked).length} connected</span><span>models enabled in Settings</span></div>
          </section>

          {error && <p className="error">{error}</p>}

          {connectState && ['starting', 'waiting', 'connected', 'failed'].includes(connectState.status) && (
            <section className="panel pad" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', gap: 14, alignItems: 'center' }}>
              <div>
                <p className="eyebrow">opencode connect</p>
                <h2 className="panel-title">{connectState.status === 'connected' ? 'Connected' : connectState.status === 'failed' ? 'Connection needs attention' : 'Authorize in your browser'}</h2>
                {connectState.error && <p className="panel-copy">{connectState.error}</p>}
                {!connectState.error && connectState.status === 'connected' && <p className="panel-copy">Next, enable the OpenCode models you want to use. Taking you there now.</p>}
                {!connectState.error && connectState.status !== 'connected' && <p className="panel-copy">Open the auth page, enter the code, then return here. AgentHub detects the completed OpenCode credential.</p>}
              </div>
              {connectState.code && <div className="pill on" style={{ fontSize: 18, fontWeight: 850, letterSpacing: '0.08em' }}>{connectState.code}</div>}
              {connectState.status === 'connected' ? <a className="btn primary" href="/settings">Enable models</a> : connectState.url && <a className="btn primary" href={connectState.url} target="_blank" rel="noreferrer">Open auth page</a>}
            </section>
          )}

          <section className="grid-3">
            {PROVIDERS.map((provider) => {
              const isConnected = connectedProvider(provider.id)
              return (
                <article key={provider.id} className="panel pad stack" style={{ borderColor: isConnected ? 'color-mix(in oklch, var(--green) 54%, var(--line))' : undefined }}>
                  <div className="cluster" style={{ justifyContent: 'space-between' }}>
                    <span className="eyebrow">{provider.eyebrow}</span>
                    <span className={`pill${isConnected ? ' on' : ''}`}>{providerStatus(provider.id)}</span>
                  </div>
                  <h2 className="page-title" style={{ fontSize: 32 }}>{provider.name}</h2>
                  <p className="panel-copy" style={{ flex: 1 }}>{provider.note}</p>
                  <button className={`btn ${provider.primary ? 'primary' : 'ghost'}`} onClick={() => beginConnect(provider.id)} disabled={connecting === provider.id}>{connecting === provider.id ? 'Starting...' : provider.connectLabel}</button>
                </article>
              )
            })}
          </section>

          {providers.filter((provider) => provider.apiKeyMasked).length > 0 && (
            <section className="panel pad stack">
              <div><p className="eyebrow">fallback credentials</p><h2 className="panel-title">Manual keys</h2></div>
              {providers.filter((provider) => provider.apiKeyMasked).map((provider) => (
                <div key={provider.id} className="row">
                  <div><strong>{MANUAL_PROVIDERS.find((item) => item.id === provider.providerId)?.name ?? provider.providerId}</strong><p className="panel-copy">{provider.label || provider.apiKeyMasked}</p></div>
                  {!provider.id.startsWith('opencode-') && <button className="btn danger" onClick={() => remove(provider.id)}>Remove</button>}
                </div>
              ))}
            </section>
          )}

          <section className="panel pad stack">
            <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setManualOpen((value) => !value)}>{manualOpen ? 'Hide manual API key setup' : 'Use API key manually'}</button>
            {manualOpen && (
              <div className="stack" style={{ maxWidth: 520 }}>
                <select className="select" value={form.providerId} onChange={(event) => setForm((current) => ({ ...current, providerId: event.target.value }))}>{MANUAL_PROVIDERS.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select>
                {selectedManualProvider.keyUrl && <a className="pill" href={selectedManualProvider.keyUrl} target="_blank" rel="noreferrer">Get API key</a>}
                <input className="input" type="password" placeholder="API key" value={form.apiKey} onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))} />
                {form.providerId === 'custom' && <input className="input" type="text" placeholder="Base URL (https://...)" value={form.baseUrl} onChange={(event) => setForm((current) => ({ ...current, baseUrl: event.target.value }))} />}
                <input className="input" type="text" placeholder="Label (optional)" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
                <button className="btn primary" onClick={saveManual} disabled={saving || !form.apiKey.trim()}>{saving ? 'Saving...' : 'Save manual key'}</button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
