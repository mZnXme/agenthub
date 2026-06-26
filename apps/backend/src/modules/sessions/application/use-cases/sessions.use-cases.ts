import { Injectable } from '@nestjs/common'
import { from, switchMap } from 'rxjs'
import { SessionsRepositoryPort } from '../../../../application/ports/database/sessions.repository.port'
import { OpenCodeClientPort } from '../../../../application/ports/opencode/opencode-client.port'
import { OpenCodeProcessManagerPort } from '../../../../application/ports/opencode/opencode-process-manager.port'
import { McpService } from '../../../mcp/mcp.service'
import { ModelsService } from '../../../models/models.service'
import { ProvidersService } from '../../../providers/providers.service'
import { SkillsService } from '../../../skills/skills.service'
import { UsageService } from '../../../usage/usage.service'

@Injectable()
export class SessionsUseCases {
  constructor(
    private readonly sessions: SessionsRepositoryPort,
    private readonly openCode: OpenCodeClientPort,
    private readonly processManager: OpenCodeProcessManagerPort,
    private readonly mcp: McpService,
    private readonly models: ModelsService,
    private readonly providers: ProvidersService,
    private readonly skills: SkillsService,
    private readonly usage: UsageService,
  ) {}

  private async injectUserConfig(userId: string, baseUrl: string) {
    const providerList = await this.providers.findByUser(userId)
    for (const p of providerList) {
      const key = await this.providers.getDecryptedKey(userId, p.providerId)
      if (!key) continue
      await this.openCode.patchConfig(
        { providers: { [p.providerId]: { apiKey: key, ...(p.baseUrl && { baseUrl: p.baseUrl }) } } },
        baseUrl,
      ).catch(() => null)
    }

    const mcpServers = await this.mcp.findRuntimeByUser(userId)
    for (const server of mcpServers.filter((item) => item.enabled)) {
      await this.openCode.addMcp(server.name, this.mcp.buildRuntimeConfig(server), baseUrl).catch(() => null)
    }

    const enabledSlugs = await this.skills.getEnabledSlugs(userId)
    if (enabledSlugs.length) {
      const skillsConfig = Object.fromEntries(enabledSlugs.map((slug) => [slug, { enabled: true }]))
      await this.openCode.patchConfig({ skills: skillsConfig }, baseUrl).catch(() => null)
    }
  }

  private async getProcessUrl(userId: string): Promise<string> {
    const { url, isNew } = await this.processManager.getOrSpawn(userId)
    if (isNew) await this.injectUserConfig(userId, url)
    return url
  }

  findByUser(userId: string) {
    return this.sessions.findByUser(userId)
  }

  async create(userId: string, title?: string) {
    await this.usage.checkLimit(userId, 'session')
    await this.usage.checkActiveSessions(userId)
    const baseUrl = await this.getProcessUrl(userId)
    const oc = await this.openCode.createSession(title, baseUrl) as { id: string }
    const pref = await this.models.getPreference(userId)
    const saved = await this.sessions.create({ userId, openCodeSessionId: oc.id, title, modelConfigId: pref?.modelConfigId })
    await this.usage.record(userId, 'session')
    return saved
  }

  async sendMessage(id: string, userId: string, content: string) {
    await this.usage.checkLimit(userId, 'message')
    const session = await this.sessions.findByIdForUser(id, userId)
    const baseUrl = await this.getProcessUrl(userId)
    const result = await this.openCode.sendMessage(session.openCodeSessionId, content, undefined, baseUrl)
    await this.usage.record(userId, 'message')

    const tokenCount = (session.tokenCount ?? 0) + Math.ceil(content.length / 4)
    await this.sessions.updateTokenCount(id, tokenCount)

    if (session.modelConfigId) {
      const threshold = await this.models.getEffectiveThreshold(userId, session.modelConfigId)
      if (threshold && tokenCount / threshold.contextLimit >= threshold.compactAt) {
        await this.openCode.compact(session.openCodeSessionId, baseUrl)
        await this.sessions.resetTokenCount(id)
      }
    }

    return result
  }

  async listMessages(id: string, userId: string) {
    const session = await this.sessions.findByIdForUser(id, userId)
    const baseUrl = await this.getProcessUrl(userId)
    const raw = await this.openCode.listMessages(session.openCodeSessionId, baseUrl) as { role: string; parts?: { type: string; text?: string }[] }[]
    return (Array.isArray(raw) ? raw : [])
      .map((message) => ({ role: message.role === 'user' ? 'user' : 'assistant', content: message.parts?.find((part) => part.type === 'text')?.text ?? '' }))
      .filter((message) => message.content)
  }

  async remove(id: string, userId: string) {
    const session = await this.sessions.findByIdForUser(id, userId)
    const baseUrl = await this.getProcessUrl(userId).catch(() => null)
    await this.openCode.deleteSession(session.openCodeSessionId, baseUrl ?? undefined).catch(() => null)
    await this.sessions.remove(id, userId)
  }

  streamEvents(id: string, userId: string) {
    return from(Promise.all([this.sessions.findByIdForUser(id, userId), this.getProcessUrl(userId)]))
      .pipe(switchMap(([session, baseUrl]) => this.openCode.streamSessionEvents(session.openCodeSessionId, baseUrl)))
  }
}
