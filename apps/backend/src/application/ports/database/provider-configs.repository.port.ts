export type ProviderConfigInput = {
  providerId: string
  apiKeyEncrypted: string
  baseUrl?: string
  modelId?: string
  label?: string
}

export type ProviderConfigRecord = {
  id: string
  userId: string
  providerId: string
  apiKeyEncrypted: string
  baseUrl?: string | null
  modelId?: string | null
  label?: string | null
}

export abstract class ProviderConfigRepository {
  abstract upsert(userId: string, data: ProviderConfigInput): Promise<unknown>
  abstract findByUser(userId: string): Promise<ProviderConfigRecord[]>
  abstract findByProvider(userId: string, providerId: string): Promise<{ apiKeyEncrypted: string } | null>
  abstract remove(id: string, userId: string): Promise<unknown>
}
