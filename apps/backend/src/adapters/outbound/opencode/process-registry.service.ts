import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { spawn, ChildProcess } from 'child_process'
import { mkdirSync } from 'fs'
import { OpenCodeProcessManagerPort } from '../../../application/ports/opencode/opencode-process-manager.port'

interface ProcessEntry {
  process: ChildProcess
  port: number
  status: 'starting' | 'running' | 'stopping' | 'failed'
  lastActivity: number
  restartCount: number
  restartWindowStart: number
  idleTimer: ReturnType<typeof setInterval>
  ready: Promise<void>
  stdoutTail: string
  stderrTail: string
}

@Injectable()
export class ProcessRegistryService implements OnApplicationShutdown, OpenCodeProcessManagerPort {
  private readonly logger = new Logger(ProcessRegistryService.name)
  private readonly registry = new Map<string, ProcessEntry>()
  private nextPort = 4100

  constructor(private readonly config: ConfigService) {}

  async getOrSpawn(userId: string): Promise<{ url: string; isNew: boolean }> {
    const entry = this.registry.get(userId)
    if (entry) {
      if (entry.status === 'failed') throw new Error('OpenCode process failed - contact support')
      entry.lastActivity = Date.now()
      if (entry.status === 'running') return { url: `http://localhost:${entry.port}`, isNew: false }
      if (entry.status === 'starting') {
        await entry.ready
        return { url: `http://localhost:${entry.port}`, isNew: false }
      }
    }
    const url = await this.spawn(userId)
    return { url, isNew: true }
  }

  private async spawn(userId: string): Promise<string> {
    const port = this.nextPort++
    const sessionRoot = this.config.get('OPENCODE_SESSION_ROOT', '/opencode-sessions')
    const sessionDir = `${sessionRoot.replace(/\/$/, '')}/user-${userId}`
    const opencodeBin = this.config.get('OPENCODE_BIN', 'opencode')
    mkdirSync(sessionDir, { recursive: true })

    const proc = spawn(opencodeBin, ['serve', '--port', String(port), '--hostname', '127.0.0.1'], {
      cwd: sessionDir,
      detached: false,
      env: {
        ...process.env,
        HOME: sessionDir,
        XDG_CONFIG_HOME: `${sessionDir}/.config`,
        XDG_DATA_HOME: `${sessionDir}/.local/share`,
      },
    })

    const entry: ProcessEntry = {
      process: proc, port, status: 'starting',
      lastActivity: Date.now(), restartCount: 0, restartWindowStart: Date.now(),
      ready: Promise.resolve(),
      stdoutTail: '',
      stderrTail: '',
      idleTimer: setInterval(() => {
        if (Date.now() - entry.lastActivity > 30 * 60 * 1000) {
          this.logger.log(`Idle timeout for user ${userId}`)
          this.kill(userId)
        }
      }, 60_000),
    }
    this.registry.set(userId, entry)

    const appendTail = (current: string, chunk: Buffer) => `${current}${chunk.toString()}`.slice(-2_000)
    proc.stdout?.on('data', (chunk: Buffer) => { entry.stdoutTail = appendTail(entry.stdoutTail, chunk) })
    proc.stderr?.on('data', (chunk: Buffer) => { entry.stderrTail = appendTail(entry.stderrTail, chunk) })

    proc.on('error', (error) => {
      entry.status = 'failed'
      this.logger.error(`OpenCode failed to spawn for user ${userId}: ${error.message}`)
    })

    proc.on('exit', () => {
      clearInterval(entry.idleTimer)
      if (entry.status !== 'failed' && entry.status !== 'stopping') this.handleCrash(userId)
    })

    entry.ready = this.waitForReady(port)
    try {
      await entry.ready
      entry.status = 'running'
    } catch (error) {
      entry.status = 'failed'
      proc.kill()
      clearInterval(entry.idleTimer)
      this.registry.delete(userId)
      this.logger.error(
        `OpenCode on port ${port} failed to start. stdout=${JSON.stringify(entry.stdoutTail)} stderr=${JSON.stringify(entry.stderrTail)}`,
      )
      throw error
    }
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
    entry.status = 'stopping'
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
