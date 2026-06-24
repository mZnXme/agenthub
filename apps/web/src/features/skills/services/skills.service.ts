import { apiClient } from '@/lib/api/client'

export interface Skill {
  id: string; slug: string; name: string; description?: string; enabled: boolean
}

export const skillsService = {
  list:    ()            => apiClient.get<Skill[]>('/api/skills'),
  enable:  (id: string) => apiClient.post<void>(`/api/skills/${id}/enable`, {}),
  disable: (id: string) => apiClient.delete<void>(`/api/skills/${id}/enable`),
}
