export type McpTransport = 'stdio' | 'sse' | 'http'

export type SecretField = {
  name: string
  label: string
  description?: string
  required?: boolean
}

export type McpCatalogItem = {
  slug: string
  name: string
  description: string
  category: 'base' | 'development' | 'design' | 'productivity' | 'cloud'
  transport: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  secretFields?: SecretField[]
  source: 'bundled' | 'local' | 'official-plugin'
  risk: 'low' | 'medium' | 'high'
}

export type McpServerInput = {
  name?: string
  transport?: string
  command?: string | null
  args?: string[] | null
  url?: string | null
  env?: Record<string, string> | null
  headers?: Record<string, string> | null
  enabled?: boolean
  catalogSlug?: string | null
  secrets?: Record<string, string> | null
}

export type McpRuntimeConfig =
  | { type: 'stdio'; command?: string | null; args?: unknown; env?: Record<string, string>; headers?: Record<string, string> }
  | { type: string; url?: string | null; env?: Record<string, string>; headers?: Record<string, string> }
