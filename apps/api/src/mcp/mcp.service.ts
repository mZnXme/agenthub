import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { McpServerConfig } from './entities/mcp-server.entity'

@Injectable()
export class McpService {
  constructor(@InjectRepository(McpServerConfig) private readonly repo: Repository<McpServerConfig>) {}

  findByUser(userId: string) {
    return this.repo.findBy({ userId })
  }

  create(userId: string, data: Partial<McpServerConfig>) {
    const entity = this.repo.create({ ...data, userId })
    return this.repo.save(entity)
  }

  async update(id: string, userId: string, data: Partial<McpServerConfig>) {
    await this.repo.update({ id, userId }, data)
    return this.repo.findOneBy({ id })
  }

  async remove(id: string, userId: string) {
    await this.repo.delete({ id, userId })
  }
}
