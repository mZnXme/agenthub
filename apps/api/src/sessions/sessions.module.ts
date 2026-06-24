import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SessionsService } from './sessions.service'
import { SessionsController } from './sessions.controller'
import { Session } from './entities/session.entity'
import { OpenCodeModule } from '../opencode/opencode.module'
import { McpModule } from '../mcp/mcp.module'
import { ModelsModule } from '../models/models.module'
import { ProvidersModule } from '../providers/providers.module'
import { SkillsModule } from '../skills/skills.module'
import { UsageModule } from '../usage/usage.module'

@Module({
  imports: [TypeOrmModule.forFeature([Session]), OpenCodeModule, McpModule, ModelsModule, ProvidersModule, SkillsModule, UsageModule],
  providers: [SessionsService],
  controllers: [SessionsController],
})
export class SessionsModule {}
