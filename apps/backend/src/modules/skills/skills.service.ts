import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { SkillsUseCases } from './application/use-cases/skills.use-cases'

@Injectable()
export class SkillsService implements OnApplicationBootstrap {
  constructor(private readonly skills: SkillsUseCases) {}

  onApplicationBootstrap() { return this.skills.seedDefaults() }
  listWithStatus(userId: string) { return this.skills.listWithStatus(userId) }
  enable(userId: string, skillId: string) { return this.skills.enable(userId, skillId) }
  disable(userId: string, skillId: string) { return this.skills.disable(userId, skillId) }
  getEnabledSlugs(userId: string) { return this.skills.getEnabledSlugs(userId) }
}
