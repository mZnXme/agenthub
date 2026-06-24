import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { UsageService } from './usage.service'

@UseGuards(JwtGuard)
@Controller()
export class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Get('usage')
  getUsage(@Req() req: any) { return this.usage.getUsage(req.user.id) }

  @Get('plans')
  listPlans() { return this.usage.listPlans() }

  @Post('plans/assign')
  assign(@Req() req: any, @Body('planSlug') planSlug: string) {
    return this.usage.assignPlan(req.user.id, planSlug)
  }
}
