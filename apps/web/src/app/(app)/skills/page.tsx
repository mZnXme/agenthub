'use client'

import { useState, useEffect } from 'react'
import { skillsService, type Skill } from '@/features/skills/services/skills.service'

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => { skillsService.list().then(setSkills) }, [])

  async function toggle(skill: Skill) {
    if (skill.enabled) {
      await skillsService.disable(skill.id)
    } else {
      await skillsService.enable(skill.id)
    }
    setSkills((prev) => prev.map((s) => s.id === skill.id ? { ...s, enabled: !s.enabled } : s))
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Skills</h1>
      <p style={s.desc}>เปิด/ปิด agent skills สำหรับ session ใหม่</p>
      <div style={s.grid}>
        {skills.map((sk) => (
          <div key={sk.id} style={{ ...s.card, borderColor: sk.enabled ? '#5865f2' : '#333' }}>
            <div style={s.cardTop}>
              <span style={s.name}>{sk.name}</span>
              <button
                style={{ ...s.toggle, background: sk.enabled ? '#5865f2' : '#222', color: sk.enabled ? '#fff' : '#888' }}
                onClick={() => toggle(sk)}
              >
                {sk.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            {sk.description && <p style={s.cardDesc}>{sk.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page:    { padding: 32, maxWidth: 760, margin: '0 auto' },
  title:   { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  desc:    { color: '#888', fontSize: 14, marginBottom: 24 },
  grid:    { display: 'flex', flexDirection: 'column', gap: 12 },
  card:    { background: '#1a1a1a', borderRadius: 10, padding: '16px 20px', border: '1px solid #333' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name:    { fontWeight: 600, fontSize: 15 },
  toggle:  { padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s' },
  cardDesc:{ color: '#888', fontSize: 13, marginTop: 6 },
}
