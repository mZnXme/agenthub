import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { SessionsModule } from './modules/sessions/sessions.module'
import { McpModule } from './modules/mcp/mcp.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { OpenCodeModule } from './adapters/outbound/opencode/opencode.module'
import { PrismaModule } from './adapters/outbound/database/prisma/prisma.module'

import { ModelsModule } from './modules/models/models.module'
import { SkillsModule } from './modules/skills/skills.module'
import { UsageModule } from './modules/usage/usage.module'
import { FilesModule } from './modules/files/files.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    McpModule,
    ProvidersModule,
    OpenCodeModule,
    ModelsModule,
    SkillsModule,
    UsageModule,
    FilesModule,
  ],
})
export class AppModule {}
