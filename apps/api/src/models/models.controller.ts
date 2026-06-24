import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { ModelsService } from './models.service'

@ApiTags('models')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  // Admin: model config CRUD
  @Get('model-configs')
  listConfigs() { return this.models.listConfigs() }

  @Post('model-configs')
  createConfig(@Body() body: { name: string; contextLimit: number; compactAt?: number }) {
    return this.models.createConfig(body)
  }

  @Patch('model-configs/:id')
  updateConfig(@Param('id') id: string, @Body() body: Partial<{ name: string; contextLimit: number; compactAt: number }>) {
    return this.models.updateConfig(id, body)
  }

  @Delete('model-configs/:id')
  deleteConfig(@Param('id') id: string) { return this.models.deleteConfig(id) }

  // User preference
  @Get('user/preference')
  getPreference(@Request() req: { user: { id: string } }) {
    return this.models.getPreference(req.user.id)
  }

  @Patch('user/preference')
  upsertPreference(
    @Request() req: { user: { id: string } },
    @Body() body: { modelConfigId?: string; compactAt?: number },
  ) {
    return this.models.upsertPreference(req.user.id, body)
  }
}
