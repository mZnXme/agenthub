import { Injectable } from '@nestjs/common'
import { CreateModelConfigInput, ModelConfigInput, ModelsRepositoryPort, PreferenceInput } from '../../../../application/ports/database/models.repository.port'

@Injectable()
export class ModelsUseCases {
  constructor(private readonly models: ModelsRepositoryPort) {}

  listConfigs() { return this.models.listConfigs() }
  createConfig(data: CreateModelConfigInput) { return this.models.createConfig(data) }
  updateConfig(id: string, data: ModelConfigInput) { return this.models.updateConfig(id, data) }
  deleteConfig(id: string) { return this.models.deleteConfig(id) }
  getPreference(userId: string) { return this.models.getPreference(userId) }
  upsertPreference(userId: string, data: PreferenceInput) { return this.models.upsertPreference(userId, data) }

  async getEffectiveThreshold(userId: string, modelConfigId?: string | null): Promise<{ contextLimit: number; compactAt: number } | null> {
    const pref = await this.models.getPreference(userId)
    const configId = pref?.modelConfigId ?? modelConfigId
    if (!configId) return null
    const config = await this.models.findConfigById(configId)
    if (!config) return null
    return { contextLimit: config.contextLimit, compactAt: pref?.compactAt ?? config.compactAt }
  }

  async getEffectiveModelName(userId: string, modelConfigId?: string | null): Promise<string | null> {
    const pref = await this.models.getPreference(userId)
    const configId = pref?.modelConfigId ?? modelConfigId
    if (!configId) return null
    const config = await this.models.findConfigById(configId)
    return config?.name ?? null
  }
}
