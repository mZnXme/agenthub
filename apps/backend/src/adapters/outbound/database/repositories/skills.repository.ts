import { Injectable } from '@nestjs/common'
import { SkillsRepositoryPort, SkillSeedData } from '../../../../application/ports/database/skills.repository.port'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaSkillsRepository implements SkillsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  upsertSkill(data: SkillSeedData) {
    return this.prisma.skill.upsert({ where: { slug: data.slug }, update: data, create: data })
  }

  listSkills() { return this.prisma.skill.findMany() }
  listEnabledUserSkills(userId: string) { return this.prisma.userSkill.findMany({ where: { userId, enabled: true }, select: { skillId: true } }) }
  findUserSkill(userId: string, skillId: string) { return this.prisma.userSkill.findUnique({ where: { userId_skillId: { userId, skillId } }, select: { enabled: true } }) }
  enable(userId: string, skillId: string) {
    return this.prisma.userSkill.upsert({ where: { userId_skillId: { userId, skillId } }, update: { enabled: true }, create: { userId, skillId, enabled: true } })
  }
  disable(userId: string, skillId: string) { return this.prisma.userSkill.updateMany({ where: { userId, skillId }, data: { enabled: false } }) }
  findSkillsByIds(ids: string[]) { return this.prisma.skill.findMany({ where: { id: { in: ids } }, select: { slug: true } }) }
}
