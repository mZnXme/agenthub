import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFileAssetInput, FileAssetRepository } from '../../../../application/ports/database/files.repository.port'

@Injectable()
export class PrismaFileAssetRepository implements FileAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateFileAssetInput) {
    return this.prisma.fileAsset.create({ data })
  }

  findByOwner(id: string, ownerId: string, status?: string) {
    return this.prisma.fileAsset.findFirst({ where: { id, ownerId, ...(status && { status }) } })
  }

  markUploaded(id: string) {
    return this.prisma.fileAsset.update({ where: { id }, data: { status: 'uploaded' } })
  }

  remove(id: string) {
    return this.prisma.fileAsset.delete({ where: { id } })
  }
}
