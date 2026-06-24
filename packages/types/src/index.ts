// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
}

// ─── AI Provider ──────────────────────────────────────────────────────────────

export type ProviderId = 'anthropic' | 'openai' | 'google' | 'custom'

export interface ProviderConfig {
  id: string
  userId: string
  providerId: ProviderId
  apiKey: string          // stored encrypted in DB
  baseUrl?: string        // for custom/self-hosted
  modelId?: string
  label?: string
}

// ─── MCP ──────────────────────────────────────────────────────────────────────

export type McpTransport = 'stdio' | 'sse' | 'http'

export interface McpServerConfig {
  id: string
  userId: string
  name: string
  transport: McpTransport
  command?: string        // stdio: e.g. "npx -y @modelcontextprotocol/server-filesystem"
  args?: string[]
  url?: string            // sse / http
  env?: Record<string, string>
  enabled: boolean
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  userId: string
  title?: string
  openCodeSessionId: string
  createdAt: string
  updatedAt: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'tool'

export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  createdAt: string
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: string
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

// ─── OpenCode passthrough ─────────────────────────────────────────────────────

export interface SendMessageDto {
  sessionId: string
  content: string
  providerId?: string
  modelId?: string
}
