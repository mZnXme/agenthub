import { Injectable } from '@nestjs/common'
import { ProvidersUseCases } from './application/use-cases/providers.use-cases'

@Injectable()
export class ProvidersService {
  constructor(private readonly providers: ProvidersUseCases) {}

  async upsert(userId: string, data: { providerId: string; apiKey: string; baseUrl?: string; modelId?: string; label?: string }) {
    return this.providers.upsert(userId, data)
  }

  findByUser(userId: string) { return this.providers.list(userId) }

  getDecryptedKey(userId: string, providerId: string) { return this.providers.getDecryptedKey(userId, providerId) }

  remove(id: string, userId: string) { return this.providers.remove(id, userId) }
}
