import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { McpServerRepository } from '../../../../application/ports/database/mcp-servers.repository.port'
import { UsageService } from '../../../usage/usage.service'
import { getMcpCatalogItem, listMcpCatalog } from '../mcp-catalog'
import { McpCommandPolicy } from '../mcp-command-policy'
import { McpSecretVault } from '../mcp-secret-vault'
import { McpRuntimeConfig, McpServerInput } from '../mcp.types'

type RuntimeServer = {
  name: string
  enabled: boolean
  transport: string
  command: string | null
  args: unknown
  url: string | null
  env: unknown
  headers?: unknown
  secretEnvEncrypted?: unknown
  [key: string]: unknown
}

function asRecord(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function assertRequiredSecrets(required: { name: string; required?: boolean }[] | undefined, secrets?: Record<string, string> | null) {
  for (const field of required ?? []) {
    if (field.required && !secrets?.[field.name]?.trim()) {
      throw new BadRequestException(`Missing required MCP secret: ${field.name}`)
    }
  }
}

@Injectable()
export class McpUseCases {
  constructor(
    private readonly repository: McpServerRepository,
    private readonly usage: UsageService,
    private readonly commandPolicy: McpCommandPolicy,
    private readonly secretVault: McpSecretVault,
  ) {}

  listCatalog() { return listMcpCatalog() }

  private sanitize(server: { secretEnvEncrypted?: unknown; [key: string]: unknown }) {
    const { secretEnvEncrypted, ...safe } = server
    return { ...safe, secretEnvKeys: this.secretVault.maskKeys(secretEnvEncrypted) }
  }

  async list(userId: string) {
    const servers = await this.repository.findByUser(userId)
    return servers.map((server) => this.sanitize(server as RuntimeServer))
  }

  findRuntimeByUser(userId: string) {
    return this.repository.findByUser(userId) as Promise<RuntimeServer[]>
  }

  async create(userId: string, data: McpServerInput) {
    this.commandPolicy.assertAllowed(data)
    await this.usage.checkMcpServers(userId)
    const created = await this.repository.create({
      userId,
      catalogSlug: data.catalogSlug,
      name: data.name ?? 'Untitled MCP',
      transport: data.transport ?? 'stdio',
      command: data.command,
      args: data.args ?? undefined,
      url: data.url,
      env: data.env ?? undefined,
      headers: data.headers ?? undefined,
      secretEnvEncrypted: this.secretVault.encryptMany(data.secrets),
      enabled: data.enabled ?? true,
    })
    return this.sanitize(created as RuntimeServer)
  }

  async installFromCatalog(userId: string, slug: string, data: Pick<McpServerInput, 'name' | 'enabled' | 'secrets'>) {
    const item = getMcpCatalogItem(slug)
    if (!item) throw new NotFoundException('MCP catalog item not found')
    assertRequiredSecrets(item.secretFields, data.secrets)
    return this.create(userId, {
      catalogSlug: item.slug,
      name: data.name ?? item.name,
      transport: item.transport,
      command: item.command,
      args: item.args,
      url: item.url,
      env: item.env,
      headers: item.headers,
      enabled: data.enabled ?? true,
      secrets: data.secrets,
    })
  }

  async update(id: string, userId: string, data: McpServerInput) {
    const existing = await this.repository.findByIdForUser(id, userId) as RuntimeServer
    this.commandPolicy.assertAllowed({
      catalogSlug: data.catalogSlug ?? (existing.catalogSlug as string | null | undefined),
      name: data.name ?? existing.name,
      transport: data.transport ?? existing.transport,
      command: data.command ?? existing.command,
      args: data.args ?? (existing.args as string[] | null),
      url: data.url ?? existing.url,
      env: data.env ?? asRecord(existing.env),
      headers: data.headers ?? asRecord(existing.headers),
      enabled: data.enabled ?? existing.enabled,
    })
    const encryptedSecrets = this.secretVault.encryptMany(data.secrets)
    const nextSecrets = encryptedSecrets
      ? { ...(asRecord(existing.secretEnvEncrypted) ?? {}), ...encryptedSecrets }
      : undefined
    const updated = await this.repository.update(id, userId, {
      catalogSlug: data.catalogSlug ?? undefined,
      name: data.name,
      transport: data.transport,
      command: data.command,
      url: data.url,
      enabled: data.enabled,
      args: data.args ?? undefined,
      env: data.env ?? undefined,
      headers: data.headers ?? undefined,
      secretEnvEncrypted: nextSecrets,
    })
    return updated ? this.sanitize(updated as RuntimeServer) : null
  }

  buildRuntimeConfig(server: RuntimeServer): McpRuntimeConfig {
    const secrets = this.secretVault.decryptMany(server.secretEnvEncrypted)
    const env = this.secretVault.resolveTemplates(asRecord(server.env), secrets)
    const headers = this.secretVault.resolveTemplates(asRecord(server.headers), secrets)
    return server.transport === 'stdio'
      ? { type: 'stdio', command: server.command, args: server.args, env, headers }
      : { type: server.transport, url: server.url, env, headers }
  }

  remove(id: string, userId: string) {
    return this.repository.remove(id, userId)
  }
}
