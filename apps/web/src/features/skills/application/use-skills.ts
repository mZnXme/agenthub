'use client'

import { useEffect, useState } from 'react'
import { skillsService, type Skill } from '../infrastructure/skills.service'

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { skillsService.list().then(setSkills).catch((e) => setError(e instanceof Error ? e.message : String(e))) }, [])

  async function toggle(skill: Skill) {
    setError(null)
    if (skill.enabled) await skillsService.disable(skill.id)
    else await skillsService.enable(skill.id)
    setSkills((prev) => prev.map((item) => item.id === skill.id ? { ...item, enabled: !item.enabled } : item))
  }

  return { skills, error, toggle }
}
