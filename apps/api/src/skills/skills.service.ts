import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Skill } from './entities/skill.entity'
import { UserSkill } from './entities/user-skill.entity'

const SEED_SKILLS = [
  { slug: 'web-search', name: 'Web Search', description: 'ค้นหาข้อมูลจากอินเทอร์เน็ตแบบ real-time' },
  { slug: 'code-review', name: 'Code Review', description: 'วิเคราะห์และรีวิวโค้ด พร้อมแนะนำการปรับปรุง' },
  { slug: 'sql-query', name: 'SQL Query', description: 'ช่วยเขียนและ optimize SQL queries' },
  { slug: 'file-analysis', name: 'File Analysis', description: 'วิเคราะห์เนื้อหาไฟล์และสรุปข้อมูลสำคัญ' },
]

@Injectable()
export class SkillsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Skill) private skills: Repository<Skill>,
    @InjectRepository(UserSkill) private userSkills: Repository<UserSkill>,
  ) {}

  async onApplicationBootstrap() {
    for (const s of SEED_SKILLS) {
      const exists = await this.skills.findOneBy({ slug: s.slug })
      if (!exists) await this.skills.save(this.skills.create(s))
    }
  }

  async listWithStatus(userId: string) {
    const all = await this.skills.find()
    const enabled = await this.userSkills.findBy({ userId, enabled: true })
    const enabledSet = new Set(enabled.map((e) => e.skillId))
    return all.map((s) => ({ ...s, enabled: enabledSet.has(s.id) }))
  }

  async enable(userId: string, skillId: string) {
    const existing = await this.userSkills.findOneBy({ userId, skillId })
    if (existing) { existing.enabled = true; return this.userSkills.save(existing) }
    return this.userSkills.save(this.userSkills.create({ userId, skillId, enabled: true }))
  }

  async disable(userId: string, skillId: string) {
    const existing = await this.userSkills.findOneBy({ userId, skillId })
    if (existing) { existing.enabled = false; await this.userSkills.save(existing) }
  }

  async getEnabledSlugs(userId: string): Promise<string[]> {
    const enabled = await this.userSkills.findBy({ userId, enabled: true })
    if (!enabled.length) return []
    const ids = enabled.map((e) => e.skillId)
    const skills = await this.skills.findByIds(ids)
    return skills.map((s) => s.slug)
  }
}
