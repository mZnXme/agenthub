import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { UsageUseCases } from './application/use-cases/usage.use-cases'

@Injectable()
export class UsageService implements OnApplicationBootstrap {
  constructor(private readonly usage: UsageUseCases) {}

  onApplicationBootstrap() { return this.usage.seedPlans() }
  getPlan(userId: string) { return this.usage.getPlan(userId) }
  getRecord(userId: string) { return this.usage.getRecord(userId) }
  getUsage(userId: string) { return this.usage.getUsage(userId) }
  checkLimit(userId: string, type: 'message' | 'session') { return this.usage.checkLimit(userId, type) }
  checkActiveSessions(userId: string) { return this.usage.checkActiveSessions(userId) }
  checkMcpServers(userId: string) { return this.usage.checkMcpServers(userId) }
  checkFileUpload(userId: string, sizeBytes: number) { return this.usage.checkFileUpload(userId, sizeBytes) }
  checkSkills(userId: string) { return this.usage.checkSkills(userId) }
  record(userId: string, type: 'message' | 'session') { return this.usage.record(userId, type) }
  recordFileUpload(userId: string, sizeBytes: number) { return this.usage.recordFileUpload(userId, sizeBytes) }
  checkAndRecord(userId: string, type: 'message' | 'session') { return this.usage.checkAndRecord(userId, type) }
  listPlans() { return this.usage.listPlans() }
  assignPlan(userId: string, planSlug: string) { return this.usage.assignPlan(userId, planSlug) }
}
