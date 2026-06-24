import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { McpService } from './mcp.service'
import { McpController } from './mcp.controller'
import { McpServerConfig } from './entities/mcp-server.entity'

@Module({
  imports: [TypeOrmModule.forFeature([McpServerConfig])],
  providers: [McpService],
  controllers: [McpController],
  exports: [McpService],
})
export class McpModule {}
