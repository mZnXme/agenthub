import { BadRequestException, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Plan } from './entities/plan.entity'
import { UserPlan } from './entities/user-plan.entity'
import { UsageRecord } from './entities/usage-record.entity'

const PLANS = [
  { slug: 'free', name: 'Free', maxMessagesPerDay: 30, maxSessionsPerDay: 3, maxActiveSessions: 5, maxMcpServers: 2, maxSkills: 3, maxFileUploadsPerDay: 5, maxFileSizeMb: 5, storageLimitMb: 50 },
  { slug: 'pro',  name: 'Pro',  maxMessagesPerDay: -1, maxSessionsPerDay: -1, maxActiveSessions: -1, maxMcpServers: 20, maxSkills: -1, maxFileUploadsPerDay: 50, maxFileSizeMb: 50, storageLimitMb: 5000 },
]

@Injectable()
export class UsageService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Plan)        private plans: Repository<Plan>,
    @InjectRepository(UserPlan)    private userPlans: Repository<UserPlan>,
    @InjectRepository(UsageRecord) private records: Repository<UsageRecord>,
  ) {}

  async onApplicationBootstrap() {
    for (const p of PLANS) {
      if (!(await this.plans.findOneBy({ slug: p.slug })))
        await this.plans.save(this.plans.create(p))
    }
  }

  private today() { return new Date().toISOString().slice(0, 10) }

  async getPlan(userId: string): Promise<Plan> {
    const up = await this.userPlans.findOneBy({ userId })
    const slug = up ? up.planId : 'free'
    return (await this.plans.findOneBy({ slug })) ?? (await this.plans.findOneBy({ slug: 'free' }))!
  }

  async getRecord(userId: string): Promise<UsageRecord> {
    const date = this.today()
    let rec = await this.records.findOneBy({ userId, date })
    if (!rec) rec = await this.records.save(this.records.create({ userId, date }))
    return rec
  }

  async getUsage(userId: string) {
    const [plan, record] = await Promise.all([this.getPlan(userId), this.getRecord(userId)])
    return { plan, record }
  }

  async checkAndRecord(userId: string, type: 'message' | 'session') {
    const [plan, record] = await Promise.all([this.getPlan(userId), this.getRecord(userId)])
    if (type === 'message' && plan.maxMessagesPerDay !== -1 && record.messageCount >= plan.maxMessagesPerDay)
      throw new BadRequestException(`Daily message limit reached (${plan.maxMessagesPerDay})`)
    if (type === 'session' && plan.maxSessionsPerDay !== -1 && record.sessionCount >= plan.maxSessionsPerDay)
      throw new BadRequestException(`Daily session limit reached (${plan.maxSessionsPerDay})`)
    if (type === 'message') await this.records.update(record.id, { messageCount: record.messageCount + 1 })
    if (type === 'session')  await this.records.update(record.id, { sessionCount: record.sessionCount + 1 })
  }

  listPlans() { return this.plans.find() }

  async assignPlan(userId: string, planSlug: string) {
    const plan = await this.plans.findOneByOrFail({ slug: planSlug })
    const existing = await this.userPlans.findOneBy({ userId })
    if (existing) { existing.planId = plan.slug; return this.userPlans.save(existing) }
    return this.userPlans.save(this.userPlans.create({ userId, planId: plan.slug }))
  }
}
