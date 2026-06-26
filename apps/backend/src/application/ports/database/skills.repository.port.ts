export type SkillSeedData = { slug: string; name: string; description?: string }

export abstract class SkillsRepositoryPort {
  abstract upsertSkill(data: SkillSeedData): Promise<unknown>
  abstract listSkills(): Promise<Array<{ id: string; slug: string; name: string; description?: string | null }>>
  abstract listEnabledUserSkills(userId: string): Promise<Array<{ skillId: string }>>
  abstract findUserSkill(userId: string, skillId: string): Promise<{ enabled: boolean } | null>
  abstract enable(userId: string, skillId: string): Promise<unknown>
  abstract disable(userId: string, skillId: string): Promise<unknown>
  abstract findSkillsByIds(ids: string[]): Promise<Array<{ slug: string }>>
}
