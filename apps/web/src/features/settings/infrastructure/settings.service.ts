import { apiClient } from '@/lib/api/client'

export interface ModelConfig { id: string; name: string; contextLimit: number; compactAt: number }
export interface UserModelOption { id: string; providerId: string; modelId: string; enabled: boolean }
export interface Preference { modelConfigId?: string; modelName?: string; enabledModels?: string[]; compactAt?: number }

export const settingsService = {
  models: () => apiClient.get<ModelConfig[]>('/api/model-configs'),
  userModels: () => apiClient.get<UserModelOption[]>('/api/user/models'),
  preference: () => apiClient.get<Preference | null>('/api/user/preference'),
  savePreference: (data: Preference) => apiClient.patch<Preference>('/api/user/preference', data),
}
