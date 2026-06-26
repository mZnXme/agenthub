import { Injectable } from '@nestjs/common'
import { SessionsUseCases } from './application/use-cases/sessions.use-cases'

@Injectable()
export class SessionsService {
  constructor(private readonly sessions: SessionsUseCases) {}

  findByUser(userId: string) { return this.sessions.findByUser(userId) }
  create(userId: string, title?: string) { return this.sessions.create(userId, title) }
  sendMessage(id: string, userId: string, content: string, options?: { modelConfigId?: string; modelName?: string; effort?: string }) { return this.sessions.sendMessage(id, userId, content, options) }
  listMessages(id: string, userId: string) { return this.sessions.listMessages(id, userId) }
  remove(id: string, userId: string) { return this.sessions.remove(id, userId) }
  streamEvents(id: string, userId: string) { return this.sessions.streamEvents(id, userId) }
}
