import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../../../../common/guards/jwt.guard'
import { McpService } from '../../mcp.service'
import { UpsertMcpServerDto } from './dto/upsert-mcp-server.dto'
import { InstallCatalogMcpDto } from './dto/install-catalog-mcp.dto'

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

  @Get('catalog')
  catalog() {
    return this.mcp.listCatalog()
  }

  @Post('catalog/:slug/install')
  installFromCatalog(
    @Request() req: { user: { id: string } },
    @Param('slug') slug: string,
    @Body() body: InstallCatalogMcpDto,
  ) {
    return this.mcp.installFromCatalog(req.user.id, slug, body)
  }

  @Post()
  create(@Request() req: { user: { id: string } }, @Body() body: UpsertMcpServerDto) {
    return this.mcp.create(req.user.id, body)
  }

  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: UpsertMcpServerDto,
  ) {
    return this.mcp.update(id, req.user.id, body)
  }

  @Delete(':id')
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.mcp.remove(id, req.user.id)
  }
}
