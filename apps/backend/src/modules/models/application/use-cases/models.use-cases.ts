import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { execFileSync } from 'child_process'
import { CreateModelConfigInput, ModelConfigInput, ModelsRepositoryPort, PreferenceInput } from '../../../../application/ports/database/models.repository.port'
import { ProvidersService } from '../../../providers/providers.service'

type OpenCodeModelOption = { id: string; providerId: string; modelId: string; enabled: boolean }

const CURATED_PROVIDER_MODELS: Record<string, string[]> = {
  openai: [
    'gpt-5.3-chat-latest',
    'gpt-5.2-chat-latest',
    'gpt-5.1-chat-latest',
    'gpt-5-pro',
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
  ],
  anthropic: [
    'claude-fable-5',
    'claude-mythos-5',
    'claude-opus-4.8',
    'claude-sonnet-4.6',
    'claude-haiku-4.5',
  ],
  google: [
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ],
}

@Injectable()
export class ModelsUseCases {
  constructor(
    private readonly models: ModelsRepositoryPort,
    private readonly providers: ProvidersService,
    private readonly config: ConfigService,
  ) {}

  listConfigs() { return this.models.listConfigs() }
  createConfig(data: CreateModelConfigInput) { return this.models.createConfig(data) }
  updateConfig(id: string, data: ModelConfigInput) { return this.models.updateConfig(id, data) }
  deleteConfig(id: string) { return this.models.deleteConfig(id) }
  getPreference(userId: string) { return this.models.getPreference(userId) }
  upsertPreference(userId: string, data: PreferenceInput) { return this.models.upsertPreference(userId, data) }

  async listUserModels(userId: string): Promise<OpenCodeModelOption[]> {
    const [providerList, preference] = await Promise.all([this.providers.findByUser(userId), this.models.getPreference(userId)])
    const connectedProviders = providerList
      .filter((provider) => provider.connectedViaOpenCode || provider.apiKeyMasked)
      .map((provider) => provider.providerId)
    const enabledModels = Array.isArray(preference?.enabledModels) ? preference.enabledModels.filter((item): item is string => typeof item === 'string') : []

    return connectedProviders.flatMap((providerId) => {
      const curated = CURATED_PROVIDER_MODELS[providerId]
      const ids = curated?.length ? curated : this.openCodeModels(providerId)
      return ids.map((id) => ({ id, providerId, modelId: id.includes('/') ? id.slice(id.indexOf('/') + 1) : id, enabled: enabledModels.includes(id) }))
    })
  }

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
    if (pref?.modelName) return pref.modelName
    const configId = pref?.modelConfigId ?? modelConfigId
    if (!configId) return null
    const config = await this.models.findConfigById(configId)
    return config?.name ?? null
  }

  private openCodeModels(providerId: string): string[] {
    const opencodeBin = this.config.get('OPENCODE_BIN', 'opencode')
    try {
      const output = execFileSync(opencodeBin, ['models', providerId], { encoding: 'utf8', timeout: 10_000 })
      return output.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.startsWith(`${providerId}/`))
    } catch {
      return []
    }
  }
}
