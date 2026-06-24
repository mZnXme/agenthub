import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { ProvidersService } from './providers.service'

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.providers.findByUser(req.user.id)
  }

  @Post()
  upsert(
    @Request() req: { user: { id: string } },
    @Body() body: { providerId: string; apiKey: string; baseUrl?: string; modelId?: string; label?: string },
  ) {
    return this.providers.upsert(req.user.id, body)
  }

  @Delete(':id')
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.providers.remove(id, req.user.id)
  }
}
