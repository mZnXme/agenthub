import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ModelConfig } from './entities/model-config.entity'
import { UserModelPreference } from './entities/user-model-preference.entity'
import { ModelsService } from './models.service'
import { ModelsController } from './models.controller'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([ModelConfig, UserModelPreference]), UsersModule],
  providers: [ModelsService],
  controllers: [ModelsController],
  exports: [ModelsService],
})
export class ModelsModule {}
