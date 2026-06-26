import { Module } from '@nestjs/common'
import { SessionsService } from './sessions.service'
import { SessionsController } from './adapters/inbound/sessions.controller'
import { OpenCodeModule } from '../../adapters/outbound/opencode/opencode.module'
import { McpModule } from '../mcp/mcp.module'
import { ModelsModule } from '../models/models.module'
import { ProvidersModule } from '../providers/providers.module'
import { SkillsModule } from '../skills/skills.module'
import { UsageModule } from '../usage/usage.module'
import { UsersModule } from '../users/users.module'
import { SessionsRepositoryPort } from '../../application/ports/database/sessions.repository.port'
import { PrismaSessionsRepository } from '../../adapters/outbound/database/repositories/sessions.repository'
import { SessionsUseCases } from './application/use-cases/sessions.use-cases'

@Module({
  imports: [OpenCodeModule, McpModule, ModelsModule, ProvidersModule, SkillsModule, UsageModule, UsersModule],
  providers: [
    SessionsService,
    SessionsUseCases,
    { provide: SessionsRepositoryPort, useClass: PrismaSessionsRepository },
  ],
  controllers: [SessionsController],
})
export class SessionsModule {}
