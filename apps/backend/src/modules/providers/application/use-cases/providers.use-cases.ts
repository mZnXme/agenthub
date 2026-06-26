import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChildProcess, spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { ProviderConfigRepository } from '../../../../application/ports/database/provider-configs.repository.port'
import { decryptSecret, encryptSecret } from '../../../../common/security/encryption'

type UpsertProviderInput = {
  providerId: string
  apiKey: string
  baseUrl?: string
  modelId?: string
  label?: string
}

type ConnectState = {
  providerId: string
  status: 'starting' | 'waiting' | 'connected' | 'failed'
  url?: string
  code?: string
  error?: string
  process?: ChildProcess
  output: string
  startedAt: number
}

const CONNECT_METHODS: Record<string, { method: string }> = {
  openai: { method: 'ChatGPT Pro/Plus (headless)' },
}

@Injectable()
export class ProvidersUseCases {
  private readonly connectStates = new Map<string, ConnectState>()

  constructor(
    private readonly providers: ProviderConfigRepository,
    private readonly config: ConfigService,
  ) {}

  private encryptionSecret() {
    return this.config.get<string>('APP_ENCRYPTION_KEY', 'dev-only-change-me')
  }

  private userOpenCodeDir(userId: string) {
    const root = this.config.get('OPENCODE_SESSION_ROOT', '/opencode-sessions')
    return `${root.replace(/\/$/, '')}/user-${userId}`
  }

  private authPath(userId: string) {
    return `${this.userOpenCodeDir(userId)}/.local/share/opencode/auth.json`
  }

  private stateKey(userId: string, providerId: string) {
    return `${userId}:${providerId}`
  }

  private hasOpenCodeCredential(userId: string, providerId: string) {
    if (!existsSync(this.authPath(userId))) return false
    if (providerId === 'openai') return true
    return false
  }

  upsert(userId: string, data: UpsertProviderInput) {
    const { apiKey, ...rest } = data
    return this.providers.upsert(userId, {
      ...rest,
      apiKeyEncrypted: encryptSecret(apiKey, this.encryptionSecret()),
    })
  }

  async list(userId: string) {
    const providers = await this.providers.findByUser(userId)
    const providerIds = new Set([...providers.map((p) => p.providerId), 'openai'])
    return Array.from(providerIds).map((providerId) => {
      const p = providers.find((provider) => provider.providerId === providerId)
      return {
        ...p,
        id: p?.id ?? `opencode-${providerId}`,
        userId,
        providerId,
        apiKeyEncrypted: undefined,
        apiKeyMasked: p ? '••••••••' : undefined,
        connectedViaOpenCode: this.hasOpenCodeCredential(userId, providerId),
      }
    })
  }

  async hasCredential(userId: string) {
    if (this.hasOpenCodeCredential(userId, 'openai')) return true
    const providers = await this.providers.findByUser(userId)
    return providers.length > 0
  }

  startConnect(userId: string, providerId: string) {
    const method = CONNECT_METHODS[providerId]
    if (!method) return { status: 'failed', error: 'This provider does not support browser connect yet. Use manual API key.' }

    const key = this.stateKey(userId, providerId)
    const existing = this.connectStates.get(key)
    if (existing && ['starting', 'waiting'].includes(existing.status)) return this.publicConnectState(existing)

    const sessionDir = this.userOpenCodeDir(userId)
    mkdirSync(sessionDir, { recursive: true })
    const opencodeBin = this.config.get('OPENCODE_BIN', 'opencode')
    const state: ConnectState = { providerId, status: 'starting', output: '', startedAt: Date.now() }
    this.connectStates.set(key, state)

    const proc = spawn(opencodeBin, ['auth', 'login', '-p', providerId, '-m', method.method], {
      cwd: sessionDir,
      env: {
        ...process.env,
        HOME: sessionDir,
        XDG_CONFIG_HOME: `${sessionDir}/.config`,
        XDG_DATA_HOME: `${sessionDir}/.local/share`,
      },
    })
    state.process = proc

    const parseOutput = (chunk: Buffer) => {
      state.output = `${state.output}${chunk.toString()}`.slice(-6_000)
      const url = state.output.match(/Go to:\s*(https?:\/\/\S+)/)?.[1]
      const code = state.output.match(/Enter code:\s*([A-Z0-9-]+)/i)?.[1]
      if (url) state.url = url
      if (code) state.code = code
      if (url || code) state.status = 'waiting'
    }

    proc.stdout?.on('data', parseOutput)
    proc.stderr?.on('data', parseOutput)
    proc.on('exit', (code) => {
      if (code === 0) state.status = 'connected'
      else {
        state.status = 'failed'
        state.error = state.output.includes('Unknown method') ? 'OpenCode does not support this login method.' : 'Connection was not completed.'
      }
      state.process = undefined
    })
    proc.on('error', (error) => {
      state.status = 'failed'
      state.error = error.message
      state.process = undefined
    })

    setTimeout(() => {
      if (state.status === 'starting') {
        state.status = 'failed'
        state.error = 'OpenCode did not return a login code. Try again or use manual API key.'
        proc.kill()
      }
    }, 15_000)

    setTimeout(() => {
      if (['starting', 'waiting'].includes(state.status)) {
        state.status = 'failed'
        state.error = 'The login code expired. Start a new connection.'
        proc.kill()
      }
    }, 10 * 60_000)

    return this.publicConnectState(state)
  }

  connectStatus(userId: string, providerId: string) {
    const state = this.connectStates.get(this.stateKey(userId, providerId))
    if (state) return this.publicConnectState(state)
    if (this.hasOpenCodeCredential(userId, providerId)) return { providerId, status: 'connected' }
    return { providerId, status: 'idle' }
  }

  private publicConnectState(state: ConnectState) {
    return { providerId: state.providerId, status: state.status, url: state.url, code: state.code, error: state.error }
  }

  async getDecryptedKey(userId: string, providerId: string) {
    const provider = await this.providers.findByProvider(userId, providerId)
    return provider ? decryptSecret(provider.apiKeyEncrypted, this.encryptionSecret()) : null
  }

  remove(id: string, userId: string) {
    return this.providers.remove(id, userId)
  }
}
