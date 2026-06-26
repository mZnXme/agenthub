import { BadRequestException, Injectable } from '@nestjs/common'
import { PlanSeedData, UsageRepositoryPort } from '../../../../application/ports/database/usage.repository.port'

const PLANS: PlanSeedData[] = [
  { slug: 'free', name: 'Free', maxMessagesPerDay: 30, maxSessionsPerDay: 3, maxActiveSessions: 5, maxMcpServers: 2, maxSkills: 3, maxFileUploadsPerDay: 5, maxFileSizeMb: 5, storageLimitMb: 50 },
  { slug: 'pro',  name: 'Pro',  maxMessagesPerDay: -1, maxSessionsPerDay: -1, maxActiveSessions: -1, maxMcpServers: 20, maxSkills: -1, maxFileUploadsPerDay: 50, maxFileSizeMb: 50, storageLimitMb: 5000 },
]

@Injectable()
export class UsageUseCases {
  constructor(private readonly usage: UsageRepositoryPort) {}

  seedPlans() { return Promise.all(PLANS.map((plan) => this.usage.upsertPlan(plan))) }
  private today() { return new Date().toISOString().slice(0, 10) }

  async getPlan(userId: string) {
    const slug = await this.usage.findUserPlanSlug(userId) ?? 'free'
    return (await this.usage.findPlanBySlug(slug)) ?? (await this.usage.findPlanBySlug('free'))!
  }

  getRecord(userId: string) { return this.usage.getOrCreateRecord(userId, this.today()) }

  async getUsage(userId: string) {
    const [plan, record] = await Promise.all([this.getPlan(userId), this.getRecord(userId)])
    return { plan, record }
  }

  async checkLimit(userId: string, type: 'message' | 'session') {
    const [plan, record] = await Promise.all([this.getPlan(userId), this.getRecord(userId)])
    if (type === 'message' && plan.maxMessagesPerDay !== -1 && record.messageCount >= plan.maxMessagesPerDay) throw new BadRequestException(`Daily message limit reached (${plan.maxMessagesPerDay})`)
    if (type === 'session' && plan.maxSessionsPerDay !== -1 && record.sessionCount >= plan.maxSessionsPerDay) throw new BadRequestException(`Daily session limit reached (${plan.maxSessionsPerDay})`)
  }

  async checkActiveSessions(userId: string) {
    const plan = await this.getPlan(userId)
    if (plan.maxActiveSessions === -1) return
    const count = await this.usage.countActiveSessions(userId)
    if (count >= plan.maxActiveSessions) throw new BadRequestException(`Active session limit reached (${plan.maxActiveSessions})`)
  }

  async checkMcpServers(userId: string) {
    const plan = await this.getPlan(userId)
    if (plan.maxMcpServers === -1) return
    const count = await this.usage.countMcpServers(userId)
    if (count >= plan.maxMcpServers) throw new BadRequestException(`MCP server limit reached (${plan.maxMcpServers})`)
  }

  async checkFileUpload(userId: string, sizeBytes: number) {
    const [plan, record] = await Promise.all([this.getPlan(userId), this.getRecord(userId)])
    const sizeMb = Math.ceil(sizeBytes / 1024 / 1024)
    if (plan.maxFileSizeMb !== -1 && sizeMb > plan.maxFileSizeMb) throw new BadRequestException(`File size limit exceeded (${plan.maxFileSizeMb} MB)`)
    if (plan.maxFileUploadsPerDay !== -1 && record.fileUploadCount >= plan.maxFileUploadsPerDay) throw new BadRequestException(`Daily file upload limit reached (${plan.maxFileUploadsPerDay})`)
    if (plan.storageLimitMb !== -1) {
      const usedMb = (await this.usage.listUploadedFileSizes(userId)).reduce((sum, file) => sum + Math.ceil(file.size / 1024 / 1024), 0)
      if (usedMb + sizeMb > plan.storageLimitMb) throw new BadRequestException(`Storage limit exceeded (${plan.storageLimitMb} MB)`)
    }
  }

  async checkSkills(userId: string) {
    const plan = await this.getPlan(userId)
    if (plan.maxSkills === -1) return
    const count = await this.usage.countEnabledSkills(userId)
    if (count >= plan.maxSkills) throw new BadRequestException(`Enabled skill limit reached (${plan.maxSkills})`)
  }

  async record(userId: string, type: 'message' | 'session') {
    const rec = await this.getRecord(userId)
    if (type === 'message') await this.usage.updateRecord(rec.id, { messageCount: rec.messageCount + 1 })
    if (type === 'session') await this.usage.updateRecord(rec.id, { sessionCount: rec.sessionCount + 1 })
  }

  async recordFileUpload(userId: string, sizeBytes: number) {
    const rec = await this.getRecord(userId)
    await this.usage.updateRecord(rec.id, {
      fileUploadCount: rec.fileUploadCount + 1,
      storageUsedMb: rec.storageUsedMb + Math.ceil(sizeBytes / 1024 / 1024),
    })
  }

  async checkAndRecord(userId: string, type: 'message' | 'session') { await this.checkLimit(userId, type); await this.record(userId, type) }
  listPlans() { return this.usage.listPlans() }
  assignPlan(userId: string, planSlug: string) { return this.usage.assignPlan(userId, planSlug) }
}
