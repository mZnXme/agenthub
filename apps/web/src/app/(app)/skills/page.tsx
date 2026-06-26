'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { useSkills } from '@/features/skills/application/use-skills'

export default function SkillsPage() {
  const { skills, error, toggle } = useSkills()

  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="workspace">
        <div className="page-grid">
          <section className="hero-row">
            <div>
              <p className="eyebrow">agent behavior</p>
              <h1 className="page-title">Switch on the skills each new session can use.</h1>
              <p className="page-copy">Skills are capability toggles for the OpenCode runtime. Keep the default surface small, then add powers deliberately.</p>
            </div>
            <div className="metric-strip"><span>{skills.filter((skill) => skill.enabled).length} enabled</span><span>{skills.length} installed</span></div>
          </section>

          {error && <p className="error">{error}</p>}

          <section className="grid-2">
            {skills.map((skill) => (
              <article key={skill.id} className="panel pad stack" style={{ borderColor: skill.enabled ? 'color-mix(in oklch, var(--green) 54%, var(--line))' : undefined }}>
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <span className="eyebrow">skill</span>
                  <button className={`btn ${skill.enabled ? 'primary' : 'ghost'}`} onClick={() => toggle(skill)}>{skill.enabled ? 'Enabled' : 'Disabled'}</button>
                </div>
                <h2 className="panel-title">{skill.name}</h2>
                {skill.description && <p className="panel-copy">{skill.description}</p>}
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}
