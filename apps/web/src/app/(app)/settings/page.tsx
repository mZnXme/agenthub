'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { useSettings } from '@/features/settings/application/use-settings'

export default function SettingsPage() {
  const { userModels, preference, setPreference, saved, error, save } = useSettings()
  const enabledModels = preference.enabledModels ?? []

  function toggleModel(modelName: string) {
    const nextEnabled = enabledModels.includes(modelName) ? enabledModels.filter((item) => item !== modelName) : [...enabledModels, modelName]
    const nextPreference = { ...preference, enabledModels: nextEnabled, ...(preference.modelName && !nextEnabled.includes(preference.modelName) ? { modelName: undefined } : {}) }
    setPreference(nextPreference)
    void save(nextPreference)
  }

  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="workspace">
        <div className="page-grid">
          <section className="hero-row">
            <div>
              <p className="eyebrow">model registry</p>
              <h1 className="page-title">Choose which OpenCode models appear in chat.</h1>
              <p className="page-copy">AgentHub lists models directly from connected providers through OpenCode. Enable only the models you actually want in your chat switcher.</p>
            </div>
            <div className="metric-strip"><span>{enabledModels.length} enabled</span><span>{userModels.length} available</span></div>
          </section>

          {error && <p className="error">{error}</p>}

          <section className="panel pad stack">
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <div><p className="eyebrow">available by provider</p><h2 className="panel-title">Enabled AI models</h2></div>
              <a className="btn ghost" href="/providers">Connect providers</a>
            </div>
            {userModels.length === 0 && <p className="panel-copy">Connect a provider first. Models appear here after OpenCode can list them.</p>}
            <div className="stack" style={{ maxHeight: 520, overflow: 'auto' }}>
              {userModels.map((model) => (
                <label key={model.id} className="row" style={{ cursor: 'pointer' }}>
                  <span className="cluster" style={{ minWidth: 0 }}>
                    <input type="checkbox" checked={enabledModels.includes(model.id)} onChange={() => toggleModel(model.id)} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model.modelId}</span>
                  </span>
                  <span className={`pill${enabledModels.includes(model.id) ? ' on' : ''}`}>{model.providerId}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="panel pad stack" style={{ maxWidth: 520 }}>
            <div><p className="eyebrow">context handling</p><h2 className="panel-title">Compaction</h2></div>
            <p className="panel-copy">Controls when AgentHub asks OpenCode to compact a long session.</p>
            <input className="input" type="number" min={0.1} max={1} step={0.05} value={preference.compactAt ?? ''} placeholder="Default from model (0.8)" onChange={(event) => setPreference((current) => ({ ...current, compactAt: event.target.value ? Number(event.target.value) : undefined }))} />
            <button className="btn primary" onClick={() => save()}>{saved ? 'Saved' : 'Save settings'}</button>
          </section>
        </div>
      </main>
    </div>
  )
}
