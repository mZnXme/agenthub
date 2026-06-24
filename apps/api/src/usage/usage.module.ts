import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Plan } from './entities/plan.entity'
import { UserPlan } from './entities/user-plan.entity'
import { UsageRecord } from './entities/usage-record.entity'
import { UsageController } from './usage.controller'
import { UsageService } from './usage.service'

@Module({
  imports: [TypeOrmModule.forFeature([Plan, UserPlan, UsageRecord])],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
