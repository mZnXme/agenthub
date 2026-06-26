'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { useMcpServers } from '@/features/mcp/application/use-mcp-servers'

export default function McpPage() {
  const { servers, catalog, error, isPending, install, add, toggle, remove } = useMcpServers()
  const [form, setForm] = useState({ name: '', transport: 'stdio', command: '', url: '' })
  const [selectedSlug, setSelectedSlug] = useState('context7')
  const [secrets, setSecrets] = useState<Record<string, string>>({})
  const selected = catalog.find((item) => item.slug === selectedSlug)

  async function addCustom() {
    const body = form.transport === 'stdio'
      ? { name: form.name, transport: 'stdio' as const, command: form.command, args: [], enabled: true }
      : { name: form.name, transport: form.transport, url: form.url, enabled: true }
    await add(body)
    setForm({ name: '', transport: 'stdio', command: '', url: '' })
  }

  async function installSelected() {
    if (!selected) return
    await install(selected.slug, secrets)
    setSecrets({})
  }

  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="workspace">
        <div className="page-grid">
          <section className="hero-row">
            <div>
              <p className="eyebrow">tool runtime</p>
              <h1 className="page-title">Attach MCP servers without losing control.</h1>
              <p className="page-copy">Install curated local tools, inject encrypted secrets, and keep every server toggle explicit.</p>
            </div>
            <div className="metric-strip"><span>{servers.filter((server) => server.enabled).length} active</span><span>{catalog.length} catalog items</span></div>
          </section>

          {error && <p className="error">{error}</p>}

          <section className="grid-2">
            <div className="panel pad stack">
              <div><p className="eyebrow">catalog</p><h2 className="panel-title">Install curated server</h2></div>
              <select className="select" value={selectedSlug} onChange={(event) => { setSelectedSlug(event.target.value); setSecrets({}) }}>{catalog.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
              {selected && <p className="panel-copy">{selected.description}</p>}
              {selected?.secretFields?.map((field) => <input key={field.name} className="input" type="password" placeholder={field.label} value={secrets[field.name] ?? ''} onChange={(event) => setSecrets((current) => ({ ...current, [field.name]: event.target.value }))} />)}
              <button className="btn primary" onClick={installSelected} disabled={isPending || !selected}>Install</button>
            </div>

            <div className="panel pad stack">
              <div><p className="eyebrow">allowlist</p><h2 className="panel-title">Add custom server</h2></div>
              <input className="input" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <select className="select" value={form.transport} onChange={(event) => setForm({ ...form, transport: event.target.value })}>
                <option value="stdio">stdio allowlist</option>
                <option value="sse">sse https</option>
                <option value="http">http https</option>
              </select>
              {form.transport === 'stdio'
                ? <input className="input" placeholder="Command must match catalog allowlist" value={form.command} onChange={(event) => setForm({ ...form, command: event.target.value })} />
                : <input className="input" placeholder="https://..." value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />}
              <button className="btn primary" onClick={addCustom}>Add server</button>
            </div>
          </section>

          <section className="panel pad stack">
            <div><p className="eyebrow">installed</p><h2 className="panel-title">Runtime servers</h2></div>
            {servers.map((server) => (
              <div key={server.id} className="row">
                <div>
                  <div className="cluster"><strong>{server.name}</strong><span className="pill">{server.transport}</span>{server.catalogSlug && <span className="pill">{server.catalogSlug}</span>}{server.enabled && <span className="pill on">enabled</span>}</div>
                  <p className="panel-copy">{server.command ?? server.url}</p>
                  {Boolean(server.secretEnvKeys?.length) && <p className="success">secrets configured: {server.secretEnvKeys?.join(', ')}</p>}
                </div>
                <div className="cluster"><button className="btn ghost" onClick={() => toggle(server.id, !server.enabled)}>{server.enabled ? 'Disable' : 'Enable'}</button><button className="btn danger" onClick={() => remove(server.id)}>Remove</button></div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}
