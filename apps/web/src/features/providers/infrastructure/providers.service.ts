import { apiClient } from '@/lib/api/client'

export interface Provider { id: string; providerId: string; label?: string; baseUrl?: string; modelId?: string; apiKeyMasked: string }

export const providersService = {
  list:   ()                                                                            => apiClient.get<Provider[]>('/api/providers'),
  upsert: (data: { providerId: string; apiKey: string; baseUrl?: string; modelId?: string; label?: string }) => apiClient.post<Provider>('/api/providers', data),
  remove: (id: string)                                                                  => apiClient.delete<void>(`/api/providers/${id}`),
}
