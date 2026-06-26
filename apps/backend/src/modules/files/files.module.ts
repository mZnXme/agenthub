import { Module } from '@nestjs/common'
import { UsageModule } from '../usage/usage.module'
import { UsersModule } from '../users/users.module'
import { FileAssetRepository } from '../../application/ports/database/files.repository.port'
import { ObjectStoragePort } from '../../application/ports/storage/object-storage.port'
import { FilesController } from './adapters/inbound/files.controller'
import { FilesUseCases } from './application/use-cases/files.use-cases'
import { FilesService } from './files.service'
import { PrismaFileAssetRepository } from '../../adapters/outbound/database/repositories/files.repository'
import { MinioObjectStorageAdapter } from '../../adapters/outbound/storage/s3-storage.adapter'

@Module({
  imports: [UsageModule, UsersModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    FilesUseCases,
    { provide: FileAssetRepository, useClass: PrismaFileAssetRepository },
    { provide: ObjectStoragePort, useClass: MinioObjectStorageAdapter },
  ],
})
export class FilesModule {}
