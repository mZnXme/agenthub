import { apiClient } from '@/lib/api/client'

export interface UsageData {
  plan: {
    name: string
    slug: string
    maxMessagesPerDay: number
    maxSessionsPerDay: number
  }
  record: {
    messageCount: number
    sessionCount: number
  }
}

export const usageService = {
  get: () => apiClient.get<UsageData>('/api/usage'),
  plans: () => apiClient.get<UsageData['plan'][]>('/api/plans'),
  assign: (planSlug: string) => apiClient.post<void>('/api/plans/assign', { planSlug }),
}
