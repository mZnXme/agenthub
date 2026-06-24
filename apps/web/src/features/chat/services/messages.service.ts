import { apiClient } from '@/lib/api/client'

export interface Message { role: string; content: string }

export const messagesService = {
  list: (sessionId: string) =>
    apiClient.get<Message[]>(`/api/sessions/${sessionId}/messages`),
  send: (sessionId: string, content: string) =>
    apiClient.post<unknown>(`/api/sessions/${sessionId}/messages`, { content }),
}
