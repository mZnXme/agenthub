import { Injectable } from '@nestjs/common'
import { CreateModelConfigInput, ModelConfigInput, ModelsRepositoryPort, PreferenceInput } from '../../../../application/ports/database/models.repository.port'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaModelsRepository implements ModelsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  listConfigs() { return this.prisma.modelConfig.findMany() }
  createConfig(data: CreateModelConfigInput) { return this.prisma.modelConfig.create({ data }) }
  updateConfig(id: string, data: ModelConfigInput) { return this.prisma.modelConfig.update({ where: { id }, data }) }
  deleteConfig(id: string) { return this.prisma.modelConfig.delete({ where: { id } }) }
  getPreference(userId: string) { return this.prisma.userModelPreference.findUnique({ where: { userId } }) }
  upsertPreference(userId: string, data: PreferenceInput) {
    return this.prisma.userModelPreference.upsert({ where: { userId }, update: data, create: { userId, ...data } })
  }
  findConfigById(id: string) { return this.prisma.modelConfig.findUnique({ where: { id } }) }
}
