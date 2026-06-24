import { apiClient } from '@/lib/api/client'

export interface McpServer {
  id: string; name: string; transport: string
  url?: string; command?: string; args?: string[]; env?: Record<string, string>; enabled: boolean
}

export const mcpService = {
  list:   ()                                       => apiClient.get<McpServer[]>('/api/mcp'),
  add:    (data: Omit<McpServer, 'id'>)            => apiClient.post<McpServer>('/api/mcp', data),
  update: (id: string, data: Partial<McpServer>)   => apiClient.patch<McpServer>(`/api/mcp/${id}`, data),
  remove: (id: string)                             => apiClient.delete<void>(`/api/mcp/${id}`),
}
