import { apiClient } from '@/lib/api/client'

export interface ModelConfig { id: string; name: string; contextLimit: number; compactAt: number }
export interface Preference { modelConfigId?: string; compactAt?: number }

export const settingsService = {
  models: () => apiClient.get<ModelConfig[]>('/api/model-configs'),
  preference: () => apiClient.get<Preference | null>('/api/user/preference'),
  savePreference: (data: Preference) => apiClient.patch<Preference>('/api/user/preference', data),
}
