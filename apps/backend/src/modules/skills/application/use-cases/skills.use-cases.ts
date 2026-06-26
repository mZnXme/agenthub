import { Injectable } from '@nestjs/common'
import { SkillsRepositoryPort, SkillSeedData } from '../../../../application/ports/database/skills.repository.port'
import { UsageService } from '../../../usage/usage.service'

const SEED_SKILLS: SkillSeedData[] = [
  { slug: 'web-search', name: 'Web Search', description: 'ค้นหาข้อมูลจากอินเทอร์เน็ตแบบ real-time' },
  { slug: 'code-review', name: 'Code Review', description: 'วิเคราะห์และรีวิวโค้ด พร้อมแนะนำการปรับปรุง' },
  { slug: 'sql-query', name: 'SQL Query', description: 'ช่วยเขียนและ optimize SQL queries' },
  { slug: 'file-analysis', name: 'File Analysis', description: 'วิเคราะห์เนื้อหาไฟล์และสรุปข้อมูลสำคัญ' },
]

@Injectable()
export class SkillsUseCases {
  constructor(
    private readonly skills: SkillsRepositoryPort,
    private readonly usage: UsageService,
  ) {}

  async seedDefaults() {
    for (const skill of SEED_SKILLS) await this.skills.upsertSkill(skill)
  }

  async listWithStatus(userId: string) {
    const [all, enabled] = await Promise.all([this.skills.listSkills(), this.skills.listEnabledUserSkills(userId)])
    const enabledSet = new Set(enabled.map((item) => item.skillId))
    return all.map((skill) => ({ ...skill, enabled: enabledSet.has(skill.id) }))
  }

  async enable(userId: string, skillId: string) {
    const existing = await this.skills.findUserSkill(userId, skillId)
    if (!existing?.enabled) await this.usage.checkSkills(userId)
    return this.skills.enable(userId, skillId)
  }

  disable(userId: string, skillId: string) { return this.skills.disable(userId, skillId) }

  async getEnabledSlugs(userId: string): Promise<string[]> {
    const enabled = await this.skills.listEnabledUserSkills(userId)
    if (!enabled.length) return []
    const skills = await this.skills.findSkillsByIds(enabled.map((item) => item.skillId))
    return skills.map((skill) => skill.slug)
  }
}
