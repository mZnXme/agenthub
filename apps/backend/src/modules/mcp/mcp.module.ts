import { Module } from '@nestjs/common'
import { McpService } from './mcp.service'
import { McpController } from './adapters/inbound/mcp.controller'
import { UsersModule } from '../users/users.module'
import { UsageModule } from '../usage/usage.module'
import { McpCommandPolicy } from './application/mcp-command-policy'
import { McpSecretVault } from './application/mcp-secret-vault'
import { McpServerRepository } from '../../application/ports/database/mcp-servers.repository.port'
import { PrismaMcpServerRepository } from '../../adapters/outbound/database/repositories/mcp-servers.repository'
import { McpUseCases } from './application/use-cases/mcp.use-cases'

@Module({
  imports: [UsersModule, UsageModule],
  providers: [
    McpService,
    McpUseCases,
    McpCommandPolicy,
    McpSecretVault,
    { provide: McpServerRepository, useClass: PrismaMcpServerRepository },
  ],
  controllers: [McpController],
  exports: [McpService],
})
export class McpModule {}
