export type CreateSessionData = {
  userId: string
  openCodeSessionId: string
  title?: string
  modelConfigId?: string | null
}

export type SessionRecord = Omit<CreateSessionData, 'title'> & {
  id: string
  title: string | null
  tokenCount: number
  createdAt: Date
  updatedAt: Date
}

export abstract class SessionsRepositoryPort {
  abstract findByUser(userId: string): Promise<SessionRecord[]>
  abstract findByIdForUser(id: string, userId: string): Promise<SessionRecord>
  abstract create(data: CreateSessionData): Promise<SessionRecord>
  abstract updateTokenCount(id: string, tokenCount: number): Promise<SessionRecord>
  abstract resetTokenCount(id: string): Promise<SessionRecord>
  abstract remove(id: string, userId: string): Promise<unknown>
}
