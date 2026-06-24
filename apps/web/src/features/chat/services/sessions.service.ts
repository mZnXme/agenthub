import { apiClient } from '@/lib/api/client'

export interface Session { id: string; title?: string }

export const sessionsService = {
  list:   ()              => apiClient.get<Session[]>('/api/sessions'),
  create: (title?: string) => apiClient.post<Session>('/api/sessions', { title }),
  remove: (id: string)    => apiClient.delete<void>(`/api/sessions/${id}`),
}
