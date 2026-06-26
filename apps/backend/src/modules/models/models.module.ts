import { Module } from '@nestjs/common'
import { ModelsService } from './models.service'
import { ModelsController } from './adapters/inbound/models.controller'
import { UsersModule } from '../users/users.module'
import { ModelsRepositoryPort } from '../../application/ports/database/models.repository.port'
import { PrismaModelsRepository } from '../../adapters/outbound/database/repositories/models.repository'
import { ModelsUseCases } from './application/use-cases/models.use-cases'

@Module({
  imports: [UsersModule],
  providers: [
    ModelsService,
    ModelsUseCases,
    { provide: ModelsRepositoryPort, useClass: PrismaModelsRepository },
  ],
  controllers: [ModelsController],
  exports: [ModelsService],
})
export class ModelsModule {}
