export abstract class OpenCodeProcessManagerPort {
  abstract getOrSpawn(userId: string): Promise<{ url: string; isNew: boolean }>
}
