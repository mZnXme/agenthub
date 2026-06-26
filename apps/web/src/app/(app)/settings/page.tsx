'use client'

import { useSettings } from '@/features/settings/application/use-settings'

export default function SettingsPage() {
  const { userModels, preference, setPreference, saved, error, save } = useSettings()
  const enabledModels = preference.enabledModels ?? []

  function toggleModel(modelName: string) {
    const nextEnabled = enabledModels.includes(modelName)
      ? enabledModels.filter((item) => item !== modelName)
      : [...enabledModels, modelName]
    const nextPreference = {
      ...preference,
      enabledModels: nextEnabled,
      ...(preference.modelName && !nextEnabled.includes(preference.modelName) ? { modelName: undefined } : {}),
    }
    setPreference(nextPreference)
    void save(nextPreference)
  }

  return (
    <div style={s.page}>
      <h2 style={s.heading}>Settings</h2>
      <p style={s.intro}>Enable the OpenCode models you want to see in chat. Only connected providers appear here.</p>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.group}>
        <label style={s.label}>Enabled AI models</label>
        {userModels.length === 0 && <p style={s.help}>Connect a provider first. Models appear here after OpenCode can list them.</p>}
        <div style={s.modelList}>
          {userModels.map((model) => (
            <label key={model.id} style={s.modelRow}>
              <input type="checkbox" checked={enabledModels.includes(model.id)} onChange={() => toggleModel(model.id)} />
              <span style={s.modelName}>{model.modelId}</span>
              <span style={s.providerPill}>{model.providerId}</span>
            </label>
          ))}
        </div>
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
      <button style={s.btn} onClick={() => save()}>{saved ? 'Saved!' : 'Save'}</button>
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
  modelList: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto', paddingRight: 4 },
  modelRow: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '9px 10px', borderRadius: 9, background: '#151515', border: '1px solid #262626', fontSize: 13 },
  modelName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  providerPill: { color: '#aaa', fontSize: 11, border: '1px solid #333', borderRadius: 999, padding: '2px 7px' },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#1e1e1e', color: '#f0f0f0', fontSize: 14 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #333', background: '#1e1e1e', color: '#f0f0f0', fontSize: 14 },
  btn: { padding: '10px 24px', background: '#5865f2', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  error: { color: '#f87171', fontSize: 13, marginBottom: 16 },
}
