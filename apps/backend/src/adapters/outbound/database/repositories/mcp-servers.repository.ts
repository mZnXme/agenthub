import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { McpServerRepository } from '../../../../application/ports/database/mcp-servers.repository.port'

@Injectable()
export class PrismaMcpServerRepository implements McpServerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.mcpServer.findMany({ where: { userId } })
  }

  findByIdForUser(id: string, userId: string) {
    return this.prisma.mcpServer.findFirstOrThrow({ where: { id, userId } })
  }

  create(data: Record<string, unknown>) {
    return this.prisma.mcpServer.create({ data: data as never })
  }

  async update(id: string, userId: string, data: Record<string, unknown>) {
    await this.prisma.mcpServer.updateMany({ where: { id, userId }, data: data as never })
    return this.prisma.mcpServer.findFirst({ where: { id, userId } })
  }

  remove(id: string, userId: string) {
    return this.prisma.mcpServer.deleteMany({ where: { id, userId } })
  }
}
