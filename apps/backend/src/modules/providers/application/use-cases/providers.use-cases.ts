import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ProviderConfigRepository } from '../../../../application/ports/database/provider-configs.repository.port'
import { decryptSecret, encryptSecret } from '../../../../common/security/encryption'

type UpsertProviderInput = {
  providerId: string
  apiKey: string
  baseUrl?: string
  modelId?: string
  label?: string
}

@Injectable()
export class ProvidersUseCases {
  constructor(
    private readonly providers: ProviderConfigRepository,
    private readonly config: ConfigService,
  ) {}

  private encryptionSecret() {
    return this.config.get<string>('APP_ENCRYPTION_KEY', 'dev-only-change-me')
  }

  upsert(userId: string, data: UpsertProviderInput) {
    const { apiKey, ...rest } = data
    return this.providers.upsert(userId, {
      ...rest,
      apiKeyEncrypted: encryptSecret(apiKey, this.encryptionSecret()),
    })
  }

  async list(userId: string) {
    const providers = await this.providers.findByUser(userId)
    return providers.map((p) => ({ ...p, apiKeyEncrypted: undefined, apiKeyMasked: '••••••••' }))
  }

  async getDecryptedKey(userId: string, providerId: string) {
    const provider = await this.providers.findByProvider(userId, providerId)
    return provider ? decryptSecret(provider.apiKeyEncrypted, this.encryptionSecret()) : null
  }

  remove(id: string, userId: string) {
    return this.providers.remove(id, userId)
  }
}
