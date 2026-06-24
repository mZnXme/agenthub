import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common'
import { spawn, ChildProcess } from 'child_process'

interface ProcessEntry {
  process: ChildProcess
  port: number
  status: 'starting' | 'running' | 'failed'
  lastActivity: number
  restartCount: number
  restartWindowStart: number
  idleTimer: ReturnType<typeof setInterval>
}

@Injectable()
export class ProcessRegistryService implements OnApplicationShutdown {
  private readonly logger = new Logger(ProcessRegistryService.name)
  private readonly registry = new Map<string, ProcessEntry>()
  private nextPort = 4100

  async getOrSpawn(userId: string): Promise<{ url: string; isNew: boolean }> {
    const entry = this.registry.get(userId)
    if (entry) {
      if (entry.status === 'failed') throw new Error('OpenCode process failed — contact support')
      entry.lastActivity = Date.now()
      if (entry.status === 'running') return { url: `http://localhost:${entry.port}`, isNew: false }
    }
    const url = await this.spawn(userId)
    return { url, isNew: true }
  }

  private async spawn(userId: string): Promise<string> {
    const port = this.nextPort++
    const sessionDir = `/opencode-sessions/user-${userId}`

    const proc = spawn('opencode', ['serve', '--port', String(port), '--session-dir', sessionDir], {
      detached: false,
    })

    const entry: ProcessEntry = {
      process: proc, port, status: 'starting',
      lastActivity: Date.now(), restartCount: 0, restartWindowStart: Date.now(),
      idleTimer: setInterval(() => {
        if (Date.now() - entry.lastActivity > 30 * 60 * 1000) {
          this.logger.log(`Idle timeout for user ${userId}`)
          this.kill(userId)
        }
      }, 60_000),
    }
    this.registry.set(userId, entry)

    proc.on('exit', () => {
      clearInterval(entry.idleTimer)
      if (entry.status !== 'failed') this.handleCrash(userId)
    })

    await this.waitForReady(port)
    entry.status = 'running'
    this.logger.log(`OpenCode spawned for user ${userId} on port ${port}`)
    return `http://localhost:${port}`
  }

  private handleCrash(userId: string) {
    const entry = this.registry.get(userId)
    if (!entry) return
    const windowMs = 5 * 60 * 1000
    if (Date.now() - entry.restartWindowStart > windowMs) {
      entry.restartCount = 0
      entry.restartWindowStart = Date.now()
    }
    entry.restartCount++
    if (entry.restartCount > 3) {
      this.logger.error(`Process for user ${userId} exceeded restart limit`)
      entry.status = 'failed'
      return
    }
    this.logger.warn(`Restarting OpenCode for user ${userId} (attempt ${entry.restartCount})`)
    this.registry.delete(userId)
    this.spawn(userId).catch(() => null)
  }

  private kill(userId: string) {
    const entry = this.registry.get(userId)
    if (!entry) return
    clearInterval(entry.idleTimer)
    entry.process.kill()
    this.registry.delete(userId)
  }

  private async waitForReady(port: number, timeout = 15_000): Promise<void> {
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://localhost:${port}/health`)
        if (res.ok) return
      } catch { /* not ready */ }
      await new Promise((r) => setTimeout(r, 300))
    }
    throw new Error(`OpenCode on port ${port} failed to start within ${timeout}ms`)
  }

  onApplicationShutdown() {
    for (const [userId] of this.registry) this.kill(userId)
  }
}
