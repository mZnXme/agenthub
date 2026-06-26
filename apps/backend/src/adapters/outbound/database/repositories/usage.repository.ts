import { Injectable } from '@nestjs/common'
import { PlanSeedData, UsageRepositoryPort } from '../../../../application/ports/database/usage.repository.port'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaUsageRepository implements UsageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  upsertPlan(data: PlanSeedData) { return this.prisma.plan.upsert({ where: { slug: data.slug }, update: data, create: data }) }
  async findUserPlanSlug(userId: string) { return (await this.prisma.userPlan.findUnique({ where: { userId } }))?.planId ?? null }
  findPlanBySlug(slug: string) { return this.prisma.plan.findUnique({ where: { slug } }) }
  getOrCreateRecord(userId: string, date: string) {
    return this.prisma.usageRecord.upsert({ where: { userId_date: { userId, date } }, update: {}, create: { userId, date } })
  }
  countActiveSessions(userId: string) { return this.prisma.session.count({ where: { userId } }) }
  countMcpServers(userId: string) { return this.prisma.mcpServer.count({ where: { userId } }) }
  countEnabledSkills(userId: string) { return this.prisma.userSkill.count({ where: { userId, enabled: true } }) }
  listUploadedFileSizes(userId: string) { return this.prisma.fileAsset.findMany({ where: { ownerId: userId, status: 'uploaded' }, select: { size: true } }) }
  updateRecord(id: string, data: Parameters<UsageRepositoryPort['updateRecord']>[1]) { return this.prisma.usageRecord.update({ where: { id }, data }) }
  listPlans() { return this.prisma.plan.findMany() }
  async assignPlan(userId: string, planSlug: string) {
    const plan = await this.prisma.plan.findUniqueOrThrow({ where: { slug: planSlug } })
    return this.prisma.userPlan.upsert({ where: { userId }, update: { planId: plan.slug }, create: { userId, planId: plan.slug } })
  }
}
