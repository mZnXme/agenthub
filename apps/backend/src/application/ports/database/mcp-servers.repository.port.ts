export abstract class McpServerRepository {
  abstract findByUser(userId: string): Promise<unknown[]>
  abstract findByIdForUser(id: string, userId: string): Promise<unknown>
  abstract create(data: Record<string, unknown>): Promise<unknown>
  abstract update(id: string, userId: string, data: Record<string, unknown>): Promise<unknown | null>
  abstract remove(id: string, userId: string): Promise<unknown>
}
