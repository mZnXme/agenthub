import { Module } from '@nestjs/common'
import { SkillsController } from './adapters/inbound/skills.controller'
import { SkillsService } from './skills.service'
import { UsersModule } from '../users/users.module'
import { UsageModule } from '../usage/usage.module'
import { SkillsRepositoryPort } from '../../application/ports/database/skills.repository.port'
import { PrismaSkillsRepository } from '../../adapters/outbound/database/repositories/skills.repository'
import { SkillsUseCases } from './application/use-cases/skills.use-cases'

@Module({
  imports: [UsersModule, UsageModule],
  controllers: [SkillsController],
  providers: [
    SkillsService,
    SkillsUseCases,
    { provide: SkillsRepositoryPort, useClass: PrismaSkillsRepository },
  ],
  exports: [SkillsService],
})
export class SkillsModule {}
