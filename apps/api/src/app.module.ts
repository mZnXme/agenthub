import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SessionsModule } from './sessions/sessions.module'
import { McpModule } from './mcp/mcp.module'
import { ProvidersModule } from './providers/providers.module'
import { OpenCodeModule } from './opencode/opencode.module'

import { ModelsModule } from './models/models.module'
import { SkillsModule } from './skills/skills.module'
import { UsageModule } from './usage/usage.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get('DB_PATH', 'data/agenthub.db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    SessionsModule,
    McpModule,
    ProvidersModule,
    OpenCodeModule,
    ModelsModule,
    SkillsModule,
    UsageModule,
  ],
})
export class AppModule {}
