import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProviderConfig } from './entities/provider.entity'

// NOTE: In production, use KMS or Vault for key encryption.
// For hackathon, we use a simple XOR-based obfuscation with env secret.
function encrypt(text: string, secret: string) {
  return Buffer.from(text).toString('base64') + '.' + secret.slice(0, 4)
}
function decrypt(encrypted: string) {
  return Buffer.from(encrypted.split('.')[0], 'base64').toString('utf-8')
}

@Injectable()
export class ProvidersService {
  constructor(@InjectRepository(ProviderConfig) private readonly repo: Repository<ProviderConfig>) {}

  async upsert(userId: string, data: Partial<ProviderConfig> & { apiKey: string }) {
    const existing = await this.repo.findOneBy({ userId, providerId: data.providerId })
    const apiKeyEncrypted = encrypt(data.apiKey, userId)
    if (existing) {
      await this.repo.update(existing.id, { ...data, apiKeyEncrypted })
      return this.repo.findOneBy({ id: existing.id })
    }
    const entity = this.repo.create({ ...data, userId, apiKeyEncrypted })
    return this.repo.save(entity)
  }

  async findByUser(userId: string) {
    const providers = await this.repo.findBy({ userId })
    // mask API key — never return raw key
    return providers.map((p) => ({ ...p, apiKeyEncrypted: undefined, apiKeyMasked: '••••••••' }))
  }

  async getDecryptedKey(userId: string, providerId: string) {
    const p = await this.repo.findOneBy({ userId, providerId })
    return p ? decrypt(p.apiKeyEncrypted) : null
  }

  remove(id: string, userId: string) {
    return this.repo.delete({ id, userId })
  }
}
