'use client'

import { useState, useEffect } from 'react'
import { mcpService, type McpServer } from '@/features/mcp/services/mcp.service'

export default function McpPage() {
  const [servers, setServers] = useState<McpServer[]>([])
  const [form, setForm] = useState({ name: '', transport: 'stdio', command: '', url: '' })

  useEffect(() => { mcpService.list().then(setServers) }, [])

  async function add() {
    const body = form.transport === 'stdio'
      ? { name: form.name, transport: 'stdio' as const, command: form.command, enabled: true }
      : { name: form.name, transport: form.transport, url: form.url, enabled: true }
    const s = await mcpService.add(body)
    setServers((prev) => [...prev, s])
    setForm({ name: '', transport: 'stdio', command: '', url: '' })
  }

  async function toggle(id: string, enabled: boolean) {
    await mcpService.update(id, { enabled })
    setServers((prev) => prev.map((s) => s.id === id ? { ...s, enabled } : s))
  }

  async function remove(id: string) {
    await mcpService.remove(id)
    setServers((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>MCP Servers</h1>
      <div style={s.card}>
        <h2 style={s.sub}>Add server</h2>
        <input style={s.input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select style={s.input} value={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.value })}>
          <option value="stdio">stdio</option>
          <option value="sse">sse</option>
          <option value="http">http</option>
        </select>
        {form.transport === 'stdio'
          ? <input style={s.input} placeholder="Command (e.g. npx -y @modelcontextprotocol/server-filesystem /tmp)" value={form.command}
              onChange={(e) => setForm({ ...form, command: e.target.value })} />
          : <input style={s.input} placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />}
        <button style={s.btn} onClick={add}>Add</button>
      </div>
      <div style={s.list}>
        {servers.map((sv) => (
          <div key={sv.id} style={s.row}>
            <div>
              <b>{sv.name}</b>
              <span style={s.badge}>{sv.transport}</span>
              <p style={s.cmd}>{sv.command ?? sv.url}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.toggleBtn} onClick={() => toggle(sv.id, !sv.enabled)}>
                {sv.enabled ? 'Disable' : 'Enable'}
              </button>
              <button style={s.removeBtn} onClick={() => remove(sv.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 32, maxWidth: 760, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  card: { background: '#1a1a1a', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  sub: { fontSize: 15, fontWeight: 600 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '8px 16px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { background: '#1a1a1a', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { marginLeft: 8, padding: '2px 8px', background: '#333', borderRadius: 4, fontSize: 11 },
  cmd: { color: '#888', fontSize: 12, marginTop: 4 },
  toggleBtn: { padding: '6px 12px', border: '1px solid #444', borderRadius: 6, background: 'transparent', color: '#ccc', cursor: 'pointer' },
  removeBtn: { padding: '6px 12px', border: '1px solid #7f1d1d', borderRadius: 6, background: 'transparent', color: '#f87171', cursor: 'pointer' },
}
