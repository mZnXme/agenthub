import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { SkillsService } from './skills.service'

@UseGuards(JwtGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  list(@Req() req: any) {
    return this.skills.listWithStatus(req.user.id)
  }

  @Post(':id/enable')
  enable(@Req() req: any, @Param('id') id: string) {
    return this.skills.enable(req.user.id, id)
  }

  @Delete(':id/enable')
  disable(@Req() req: any, @Param('id') id: string) {
    return this.skills.disable(req.user.id, id)
  }
}
