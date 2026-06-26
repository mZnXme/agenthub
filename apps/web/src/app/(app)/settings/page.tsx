'use client'

import { useSettings } from '@/features/settings/application/use-settings'

export default function SettingsPage() {
  const { models, preference, setPreference, saved, error, save } = useSettings()

  return (
    <div style={s.page}>
      <h2 style={s.heading}>Settings</h2>
      <p style={s.intro}>Provider keys live in AI Providers. Choose the model AgentHub sends to OpenCode here; the model id also selects the matching provider prefix such as anthropic, openai, or google.</p>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.group}>
        <label style={s.label}>AI Model</label>
        <select
          style={s.select}
          value={preference.modelConfigId ?? ''}
          onChange={(e) => setPreference((current) => ({ ...current, modelConfigId: e.target.value || undefined }))}
        >
          <option value="">Use OpenCode default</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>{model.name} ({model.contextLimit.toLocaleString()} ctx)</option>
          ))}
        </select>
        {models.length === 0 && <p style={s.help}>No model presets are configured yet. Chat will use OpenCode's default model.</p>}
      </div>
      <div style={s.group}>
        <label style={s.label}>Compact threshold (0.0 - 1.0)</label>
        <input
          style={s.input}
          type="number" min={0.1} max={1} step={0.05}
          value={preference.compactAt ?? ''}
          placeholder="Default from model (0.8)"
          onChange={(e) => setPreference((current) => ({ ...current, compactAt: e.target.value ? Number(e.target.value) : undefined }))}
        />
      </div>
      <button style={s.btn} onClick={save}>{saved ? 'Saved!' : 'Save'}</button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 40, maxWidth: 480, color: '#f0f0f0' },
  heading: { fontSize: 20, fontWeight: 700, marginBottom: 32 },
  intro: { margin: '-20px 0 28px', color: '#a1a1aa', fontSize: 14, lineHeight: 1.6 },
  group: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
  label: { fontSize: 13, color: '#aaa' },
  help: { margin: '4px 0 0', color: '#888', fontSize: 12, lineHeight: 1.5 },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#1e1e1e', color: '#f0f0f0', fontSize: 14 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#1e1e1e', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '10px 24px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  error: { color: '#f87171', fontSize: 13, marginBottom: 16 },
}
