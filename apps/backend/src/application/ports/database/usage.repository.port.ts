export type PlanSeedData = {
  slug: string
  name: string
  maxMessagesPerDay: number
  maxSessionsPerDay: number
  maxActiveSessions: number
  maxMcpServers: number
  maxSkills: number
  maxFileUploadsPerDay: number
  maxFileSizeMb: number
  storageLimitMb: number
}

export type PlanRecord = PlanSeedData
export type UsageRecordData = { id: string; messageCount: number; sessionCount: number; fileUploadCount: number; storageUsedMb: number }

export abstract class UsageRepositoryPort {
  abstract upsertPlan(data: PlanSeedData): Promise<unknown>
  abstract findUserPlanSlug(userId: string): Promise<string | null>
  abstract findPlanBySlug(slug: string): Promise<PlanRecord | null>
  abstract getOrCreateRecord(userId: string, date: string): Promise<UsageRecordData>
  abstract countActiveSessions(userId: string): Promise<number>
  abstract countMcpServers(userId: string): Promise<number>
  abstract countEnabledSkills(userId: string): Promise<number>
  abstract listUploadedFileSizes(userId: string): Promise<Array<{ size: number }>>
  abstract updateRecord(id: string, data: Partial<Pick<UsageRecordData, 'messageCount' | 'sessionCount' | 'fileUploadCount' | 'storageUsedMb'>>): Promise<unknown>
  abstract listPlans(): Promise<unknown[]>
  abstract assignPlan(userId: string, planSlug: string): Promise<unknown>
}
