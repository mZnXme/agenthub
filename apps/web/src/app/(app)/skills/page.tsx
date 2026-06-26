'use client'

import { useSkills } from '@/features/skills/application/use-skills'

export default function SkillsPage() {
  const { skills, error, toggle } = useSkills()

  return (
    <div style={s.page}>
      <h1 style={s.title}>Skills</h1>
      <p style={s.desc}>เปิด/ปิด agent skills สำหรับ session ใหม่</p>
      {error && <p style={s.error}>{error}</p>}
      <div style={s.grid}>
        {skills.map((skill) => (
          <div key={skill.id} style={{ ...s.card, borderColor: skill.enabled ? '#5865f2' : '#333' }}>
            <div style={s.cardTop}>
              <span style={s.name}>{skill.name}</span>
              <button style={{ ...s.toggle, background: skill.enabled ? '#5865f2' : '#222', color: skill.enabled ? '#fff' : '#888' }} onClick={() => toggle(skill)}>
                {skill.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            {skill.description && <p style={s.cardDesc}>{skill.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 32, maxWidth: 760, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  desc: { color: '#888', fontSize: 14, marginBottom: 24 },
  grid: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#1a1a1a', borderRadius: 10, padding: '16px 20px', border: '1px solid #333' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 600, fontSize: 15 },
  toggle: { padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s' },
  cardDesc: { color: '#888', fontSize: 13, marginTop: 6 },
  error: { color: '#f87171', fontSize: 13 },
}
