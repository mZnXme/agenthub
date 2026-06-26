import { Injectable } from '@nestjs/common'
import { CreateModelConfigInput, ModelConfigInput, PreferenceInput } from '../../application/ports/database/models.repository.port'
import { ModelsUseCases } from './application/use-cases/models.use-cases'

@Injectable()
export class ModelsService {
  constructor(private readonly models: ModelsUseCases) {}

  listConfigs() { return this.models.listConfigs() }
  createConfig(data: CreateModelConfigInput) { return this.models.createConfig(data) }
  updateConfig(id: string, data: ModelConfigInput) { return this.models.updateConfig(id, data) }
  deleteConfig(id: string) { return this.models.deleteConfig(id) }
  getPreference(userId: string) { return this.models.getPreference(userId) }
  upsertPreference(userId: string, data: PreferenceInput) { return this.models.upsertPreference(userId, data) }
  getEffectiveThreshold(userId: string, modelConfigId?: string) { return this.models.getEffectiveThreshold(userId, modelConfigId) }
}
