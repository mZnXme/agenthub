import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { McpService } from './mcp.service'
import { McpController } from './mcp.controller'
import { McpServerConfig } from './entities/mcp-server.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([McpServerConfig]), UsersModule],
  providers: [McpService],
  controllers: [McpController],
  exports: [McpService],
})
export class McpModule {}
