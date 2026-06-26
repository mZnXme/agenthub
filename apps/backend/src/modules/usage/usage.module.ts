import { Module } from '@nestjs/common'
import { UsageController } from './adapters/inbound/usage.controller'
import { UsageService } from './usage.service'
import { UsersModule } from '../users/users.module'
import { UsageRepositoryPort } from '../../application/ports/database/usage.repository.port'
import { PrismaUsageRepository } from '../../adapters/outbound/database/repositories/usage.repository'
import { UsageUseCases } from './application/use-cases/usage.use-cases'

@Module({
  imports: [UsersModule],
  controllers: [UsageController],
  providers: [
    UsageService,
    UsageUseCases,
    { provide: UsageRepositoryPort, useClass: PrismaUsageRepository },
  ],
  exports: [UsageService],
})
export class UsageModule {}
