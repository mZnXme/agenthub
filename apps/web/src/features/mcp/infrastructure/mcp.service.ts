import { apiClient } from '@/lib/api/client'

export interface McpServer {
  id: string; name: string; transport: string
  url?: string; command?: string; args?: string[]; env?: Record<string, string>; headers?: Record<string, string>
  catalogSlug?: string; enabled: boolean; secretEnvKeys?: string[]
}

export interface McpCatalogItem {
  slug: string; name: string; description: string; category: string; transport: string
  command?: string; args?: string[]; url?: string; envKeys: string[]; headerKeys: string[]
  requiresSecrets: boolean; secretFields?: { name: string; label: string; description?: string; required?: boolean }[]
  source: string; risk: string
}

export const mcpService = {
  list:   ()                                       => apiClient.get<McpServer[]>('/api/mcp'),
  catalog:()                                       => apiClient.get<McpCatalogItem[]>('/api/mcp/catalog'),
  add:    (data: Omit<McpServer, 'id'> & { secrets?: Record<string, string> }) => apiClient.post<McpServer>('/api/mcp', data),
  install:(slug: string, data: { name?: string; enabled?: boolean; secrets?: Record<string, string> }) => apiClient.post<McpServer>(`/api/mcp/catalog/${slug}/install`, data),
  update: (id: string, data: Partial<McpServer>)   => apiClient.patch<McpServer>(`/api/mcp/${id}`, data),
  remove: (id: string)                             => apiClient.delete<void>(`/api/mcp/${id}`),
}
