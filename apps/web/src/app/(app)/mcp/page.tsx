'use client'

import { useState } from 'react'
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
    <div style={s.page}>
      <h1 style={s.title}>MCP Servers</h1>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.grid}>
        <section style={s.card}>
          <h2 style={s.sub}>Install from catalog</h2>
          <select style={s.input} value={selectedSlug} onChange={(e) => { setSelectedSlug(e.target.value); setSecrets({}) }}>
            {catalog.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
          {selected && <p style={s.desc}>{selected.description}</p>}
          {selected?.secretFields?.map((field) => (
            <input
              key={field.name}
              style={s.input}
              type="password"
              placeholder={field.label}
              value={secrets[field.name] ?? ''}
              onChange={(e) => setSecrets((current) => ({ ...current, [field.name]: e.target.value }))}
            />
          ))}
          <button style={s.btn} onClick={installSelected} disabled={isPending || !selected}>Install</button>
        </section>
        <section style={s.card}>
          <h2 style={s.sub}>Add allowed custom server</h2>
          <input style={s.input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select style={s.input} value={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.value })}>
            <option value="stdio">stdio allowlist</option>
            <option value="sse">sse https</option>
            <option value="http">http https</option>
          </select>
          {form.transport === 'stdio'
            ? <input style={s.input} placeholder="Command must match catalog allowlist" value={form.command} onChange={(e) => setForm({ ...form, command: e.target.value })} />
            : <input style={s.input} placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />}
          <button style={s.btn} onClick={addCustom}>Add</button>
        </section>
      </div>
      <div style={s.list}>
        {servers.map((server) => (
          <div key={server.id} style={s.row}>
            <div>
              <b>{server.name}</b>
              <span style={s.badge}>{server.transport}</span>
              {server.catalogSlug && <span style={s.badge}>{server.catalogSlug}</span>}
              <p style={s.cmd}>{server.command ?? server.url}</p>
              {Boolean(server.secretEnvKeys?.length) && <p style={s.secret}>secrets configured: {server.secretEnvKeys?.join(', ')}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.toggleBtn} onClick={() => toggle(server.id, !server.enabled)}>{server.enabled ? 'Disable' : 'Enable'}</button>
              <button style={s.removeBtn} onClick={() => remove(server.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 32, maxWidth: 980, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 },
  card: { background: '#12121a', border: '1px solid #242436', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  sub: { fontSize: 15, fontWeight: 700 },
  desc: { color: '#9ca3af', fontSize: 13, lineHeight: 1.5 },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #333', background: '#0b0b10', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '9px 16px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { background: '#12121a', border: '1px solid #242436', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  badge: { marginLeft: 8, padding: '2px 8px', background: '#2a2a3e', borderRadius: 99, fontSize: 11, color: '#c7d2fe' },
  cmd: { color: '#888', fontSize: 12, marginTop: 4 },
  secret: { color: '#60a5fa', fontSize: 12, marginTop: 4 },
  error: { color: '#f87171', marginBottom: 12 },
  toggleBtn: { padding: '6px 12px', border: '1px solid #444', borderRadius: 6, background: 'transparent', color: '#ccc', cursor: 'pointer' },
  removeBtn: { padding: '6px 12px', border: '1px solid #7f1d1d', borderRadius: 6, background: 'transparent', color: '#f87171', cursor: 'pointer' },
}
