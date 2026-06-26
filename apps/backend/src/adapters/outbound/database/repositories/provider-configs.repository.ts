import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ProviderConfigInput, ProviderConfigRepository } from '../../../../application/ports/database/provider-configs.repository.port'

@Injectable()
export class PrismaProviderConfigRepository implements ProviderConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(userId: string, data: ProviderConfigInput) {
    return this.prisma.providerConfig.upsert({
      where: { userId_providerId: { userId, providerId: data.providerId } },
      update: data,
      create: { ...data, userId },
    })
  }

  findByUser(userId: string) {
    return this.prisma.providerConfig.findMany({ where: { userId } })
  }

  findByProvider(userId: string, providerId: string) {
    return this.prisma.providerConfig.findUnique({ where: { userId_providerId: { userId, providerId } } })
  }

  remove(id: string, userId: string) {
    return this.prisma.providerConfig.deleteMany({ where: { id, userId } })
  }
}
