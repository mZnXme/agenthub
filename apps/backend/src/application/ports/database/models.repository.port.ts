export type ModelConfigInput = { name?: string; contextLimit?: number; compactAt?: number }
export type CreateModelConfigInput = Required<Pick<ModelConfigInput, 'name' | 'contextLimit'>> & { compactAt?: number }
export type PreferenceInput = { modelConfigId?: string; compactAt?: number }
export type PreferenceRecord = { modelConfigId?: string | null; compactAt?: number | null }
export type ModelConfigRecord = { name: string; contextLimit: number; compactAt: number }

export abstract class ModelsRepositoryPort {
  abstract listConfigs(): Promise<unknown[]>
  abstract createConfig(data: CreateModelConfigInput): Promise<unknown>
  abstract updateConfig(id: string, data: ModelConfigInput): Promise<unknown>
  abstract deleteConfig(id: string): Promise<unknown>
  abstract getPreference(userId: string): Promise<PreferenceRecord | null>
  abstract upsertPreference(userId: string, data: PreferenceInput): Promise<unknown>
  abstract findConfigById(id: string): Promise<ModelConfigRecord | null>
}
