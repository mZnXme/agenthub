import { Injectable } from '@nestjs/common'
import { McpRuntimeConfig, McpServerInput } from './application/mcp.types'
import { McpUseCases } from './application/use-cases/mcp.use-cases'

@Injectable()
export class McpService {
  constructor(private readonly mcp: McpUseCases) {}

  listCatalog() { return this.mcp.listCatalog() }
  findByUser(userId: string) { return this.mcp.list(userId) }
  findRuntimeByUser(userId: string) { return this.mcp.findRuntimeByUser(userId) }
  create(userId: string, data: McpServerInput) { return this.mcp.create(userId, data) }
  installFromCatalog(userId: string, slug: string, data: Pick<McpServerInput, 'name' | 'enabled' | 'secrets'>) {
    return this.mcp.installFromCatalog(userId, slug, data)
  }
  update(id: string, userId: string, data: McpServerInput) { return this.mcp.update(id, userId, data) }
  buildRuntimeConfig(server: Parameters<McpUseCases['buildRuntimeConfig']>[0]): McpRuntimeConfig {
    return this.mcp.buildRuntimeConfig(server)
  }
  remove(id: string, userId: string) { return this.mcp.remove(id, userId) }
}
