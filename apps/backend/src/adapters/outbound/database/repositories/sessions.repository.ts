import { Injectable } from '@nestjs/common'
import { CreateSessionData, SessionsRepositoryPort } from '../../../../application/ports/database/sessions.repository.port'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaSessionsRepository implements SessionsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.session.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })
  }

  findByIdForUser(id: string, userId: string) {
    return this.prisma.session.findFirstOrThrow({ where: { id, userId } })
  }

  create(data: CreateSessionData) {
    return this.prisma.session.create({ data })
  }

  updateTokenCount(id: string, tokenCount: number) {
    return this.prisma.session.update({ where: { id }, data: { tokenCount } })
  }

  resetTokenCount(id: string) {
    return this.prisma.session.update({ where: { id }, data: { tokenCount: 0 } })
  }

  remove(id: string, userId: string) {
    return this.prisma.session.deleteMany({ where: { id, userId } })
  }
}
