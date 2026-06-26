import { Module } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { ProvidersController } from './adapters/inbound/providers.controller'
import { UsersModule } from '../users/users.module'
import { ProviderConfigRepository } from '../../application/ports/database/provider-configs.repository.port'
import { PrismaProviderConfigRepository } from '../../adapters/outbound/database/repositories/provider-configs.repository'
import { ProvidersUseCases } from './application/use-cases/providers.use-cases'

@Module({
  imports: [UsersModule],
  providers: [
    ProvidersService,
    ProvidersUseCases,
    { provide: ProviderConfigRepository, useClass: PrismaProviderConfigRepository },
  ],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModule {}
