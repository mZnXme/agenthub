import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProvidersService } from './providers.service'
import { ProvidersController } from './providers.controller'
import { ProviderConfig } from './entities/provider.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ProviderConfig])],
  providers: [ProvidersService],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModule {}
