import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../../../../common/guards/admin.guard'
import { JwtGuard } from '../../../../common/guards/jwt.guard'
import { UsageService } from '../../usage.service'
import { AssignPlanDto } from './dto/assign-plan.dto'

@UseGuards(JwtGuard)
@Controller()
export class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Get('usage')
  getUsage(@Req() req: any) { return this.usage.getUsage(req.user.id) }

  @Get('plans')
  listPlans() { return this.usage.listPlans() }

  @Post('plans/assign')
  @UseGuards(AdminGuard)
  assign(@Req() req: any, @Body() body: AssignPlanDto) {
    return this.usage.assignPlan(body.userId ?? req.user.id, body.planSlug)
  }
}
