'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ModelConfig { id: string; name: string; contextLimit: number; compactAt: number }
interface Preference { modelConfigId?: string; compactAt?: number }

export default function SettingsPage() {
  const router = useRouter()
  const [models, setModels] = useState<ModelConfig[]>([])
  const [pref, setPref] = useState<Preference>({})
  const [saved, setSaved] = useState(false)

  const api = process.env.NEXT_PUBLIC_API_URL
  const token = () => localStorage.getItem('token')
  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` })

  useEffect(() => {
    if (!token()) { router.push('/login'); return }
    Promise.all([
      fetch(`${api}/api/model-configs`, { headers: headers() }).then((r) => r.json()),
      fetch(`${api}/api/user/preference`, { headers: headers() }).then((r) => r.json()),
    ]).then(([m, p]) => { setModels(m ?? []); setPref(p ?? {}) })
  }, [])

  async function save() {
    await fetch(`${api}/api/user/preference`, {
      method: 'PATCH', headers: headers(), body: JSON.stringify(pref),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={s.page}>
      <h2 style={s.heading}>Settings</h2>
      <div style={s.group}>
        <label style={s.label}>AI Model</label>
        <select
          style={s.select}
          value={pref.modelConfigId ?? ''}
          onChange={(e) => setPref((p) => ({ ...p, modelConfigId: e.target.value || undefined }))}
        >
          <option value="">— select model —</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.contextLimit.toLocaleString()} ctx)</option>
          ))}
        </select>
      </div>
      <div style={s.group}>
        <label style={s.label}>Compact threshold (0.0 – 1.0)</label>
        <input
          style={s.input}
          type="number" min={0.1} max={1} step={0.05}
          value={pref.compactAt ?? ''}
          placeholder="Default from model (0.8)"
          onChange={(e) => setPref((p) => ({ ...p, compactAt: e.target.value ? Number(e.target.value) : undefined }))}
        />
      </div>
      <button style={s.btn} onClick={save}>{saved ? 'Saved!' : 'Save'}</button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 480, color: '#f0f0f0' },
  heading: { fontSize: 20, fontWeight: 700, marginBottom: 32 },
  group: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
  label: { fontSize: 13, color: '#aaa' },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#1e1e1e', color: '#f0f0f0', fontSize: 14 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#1e1e1e', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '10px 24px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
}
