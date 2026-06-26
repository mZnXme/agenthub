import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../../../../common/guards/jwt.guard'
import { ProvidersService } from '../../providers.service'
import { UpsertProviderDto } from './dto/upsert-provider.dto'

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
    @Body() body: UpsertProviderDto,
  ) {
    return this.providers.upsert(req.user.id, body)
  }

  @Post(':providerId/connect')
  startConnect(
    @Request() req: { user: { id: string } },
    @Param('providerId') providerId: string,
  ) {
    return this.providers.startConnect(req.user.id, providerId)
  }

  @Get(':providerId/connect')
  connectStatus(
    @Request() req: { user: { id: string } },
    @Param('providerId') providerId: string,
  ) {
    return this.providers.connectStatus(req.user.id, providerId)
  }

  @Delete(':id')
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.providers.remove(id, req.user.id)
  }
}
