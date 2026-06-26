import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AdminGuard } from '../../../../common/guards/admin.guard'
import { JwtGuard } from '../../../../common/guards/jwt.guard'
import { ModelsService } from '../../models.service'
import { CreateModelConfigDto } from './dto/create-model-config.dto'
import { UpdateModelConfigDto } from './dto/update-model-config.dto'
import { UpsertUserPreferenceDto } from './dto/upsert-user-preference.dto'

@ApiTags('models')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  // All users can read model options; mutations are admin-only.
  @Get('model-configs')
  listConfigs() { return this.models.listConfigs() }

  @Get('user/models')
  listUserModels(@Request() req: { user: { id: string } }) {
    return this.models.listUserModels(req.user.id)
  }

  @Post('model-configs')
  @UseGuards(AdminGuard)
  createConfig(@Body() body: CreateModelConfigDto) {
    return this.models.createConfig(body)
  }

  @Patch('model-configs/:id')
  @UseGuards(AdminGuard)
  updateConfig(@Param('id') id: string, @Body() body: UpdateModelConfigDto) {
    return this.models.updateConfig(id, body)
  }

  @Delete('model-configs/:id')
  @UseGuards(AdminGuard)
  deleteConfig(@Param('id') id: string) { return this.models.deleteConfig(id) }

  // User preference
  @Get('user/preference')
  getPreference(@Request() req: { user: { id: string } }) {
    return this.models.getPreference(req.user.id)
  }

  @Patch('user/preference')
  upsertPreference(
    @Request() req: { user: { id: string } },
    @Body() body: UpsertUserPreferenceDto,
  ) {
    return this.models.upsertPreference(req.user.id, body)
  }
}
