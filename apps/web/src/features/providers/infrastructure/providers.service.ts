import { apiClient } from '@/lib/api/client'

export interface Provider { id: string; providerId: string; label?: string; baseUrl?: string; modelId?: string; apiKeyMasked?: string; connectedViaOpenCode?: boolean }
export interface ProviderConnectState { providerId: string; status: 'idle' | 'starting' | 'waiting' | 'connected' | 'failed'; url?: string; code?: string; error?: string }

export const providersService = {
  list:   ()                                                                            => apiClient.get<Provider[]>('/api/providers'),
  upsert: (data: { providerId: string; apiKey: string; baseUrl?: string; modelId?: string; label?: string }) => apiClient.post<Provider>('/api/providers', data),
  connect: (providerId: string)                                                         => apiClient.post<ProviderConnectState>(`/api/providers/${providerId}/connect`, {}),
  connectStatus: (providerId: string)                                                   => apiClient.get<ProviderConnectState>(`/api/providers/${providerId}/connect`),
  remove: (id: string)                                                                  => apiClient.delete<void>(`/api/providers/${id}`),
}
