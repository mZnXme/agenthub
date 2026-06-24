import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ModelConfig } from './entities/model-config.entity'
import { UserModelPreference } from './entities/user-model-preference.entity'

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelConfig) private readonly configs: Repository<ModelConfig>,
    @InjectRepository(UserModelPreference) private readonly prefs: Repository<UserModelPreference>,
  ) {}

  listConfigs() { return this.configs.find() }
  createConfig(data: Partial<ModelConfig>) { return this.configs.save(this.configs.create(data)) }
  updateConfig(id: string, data: Partial<ModelConfig>) { return this.configs.update(id, data) }
  deleteConfig(id: string) { return this.configs.delete(id) }

  async getPreference(userId: string) {
    return this.prefs.findOneBy({ userId }) ?? null
  }

  async upsertPreference(userId: string, data: { modelConfigId?: string; compactAt?: number }) {
    const existing = await this.prefs.findOneBy({ userId })
    if (existing) {
      return this.prefs.save({ ...existing, ...data })
    }
    return this.prefs.save(this.prefs.create({ userId, ...data }))
  }

  async getEffectiveThreshold(userId: string, modelConfigId?: string): Promise<{ contextLimit: number; compactAt: number } | null> {
    const pref = await this.prefs.findOneBy({ userId })
    const configId = pref?.modelConfigId ?? modelConfigId
    if (!configId) return null
    const config = await this.configs.findOneBy({ id: configId })
    if (!config) return null
    return { contextLimit: config.contextLimit, compactAt: pref?.compactAt ?? config.compactAt }
  }
}
