import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { McpService } from './mcp.service'
import { McpServerConfig } from './entities/mcp-server.entity'

@ApiTags('mcp')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('mcp')
export class McpController {
  constructor(private readonly mcp: McpService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.mcp.findByUser(req.user.id)
  }

  @Post()
  create(@Request() req: { user: { id: string } }, @Body() body: Partial<McpServerConfig>) {
    return this.mcp.create(req.user.id, body)
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: Partial<McpServerConfig>,
  ) {
    return this.mcp.update(id, req.user.id, body)
  }

  @Delete(':id')
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.mcp.remove(id, req.user.id)
  }
}
