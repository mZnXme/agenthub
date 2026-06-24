import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { from, switchMap } from 'rxjs'
import { Session } from './entities/session.entity'
import { OpenCodeService } from '../opencode/opencode.service'
import { McpService } from '../mcp/mcp.service'
import { ProcessRegistryService } from '../opencode/process-registry.service'
import { ModelsService } from '../models/models.service'
import { ProvidersService } from '../providers/providers.service'
import { SkillsService } from '../skills/skills.service'
import { UsageService } from '../usage/usage.service'

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly repo: Repository<Session>,
    private readonly openCode: OpenCodeService,
    private readonly mcp: McpService,
    private readonly processRegistry: ProcessRegistryService,
    private readonly models: ModelsService,
    private readonly providers: ProvidersService,
    private readonly skills: SkillsService,
    private readonly usage: UsageService,
  ) {}

  /** Push provider keys + MCP configs into a freshly spawned process. */
  private async injectUserConfig(userId: string, baseUrl: string) {
    // providers
    const providerList = await this.providers.findByUser(userId)
    for (const p of providerList) {
      const key = await this.providers.getDecryptedKey(userId, p.providerId)
      if (!key) continue
      await this.openCode.patchConfig(
        { providers: { [p.providerId]: { apiKey: key, ...(p.baseUrl && { baseUrl: p.baseUrl }) } } },
        baseUrl,
      ).catch(() => null)
    }
    // MCP servers
    const mcpServers = await this.mcp.findByUser(userId)
    for (const s of mcpServers.filter((m) => m.enabled)) {
      const cfg = s.transport === 'stdio'
        ? { type: 'stdio', command: s.command, args: s.args, env: s.env }
        : { type: s.transport, url: s.url }
      await this.openCode.addMcp(s.name, cfg, baseUrl).catch(() => null)
    }
    // Skills
    const enabledSlugs = await this.skills.getEnabledSlugs(userId)
    if (enabledSlugs.length) {
      const skillsConfig = Object.fromEntries(enabledSlugs.map((slug) => [slug, { enabled: true }]))
      await this.openCode.patchConfig({ skills: skillsConfig }, baseUrl).catch(() => null)
    }
  }

  private async getProcessUrl(userId: string): Promise<string> {
    const { url, isNew } = await this.processRegistry.getOrSpawn(userId)
    if (isNew) await this.injectUserConfig(userId, url)
    return url
  }

  findByUser(userId: string) {
    return this.repo.findBy({ userId })
  }

  async create(userId: string, title?: string) {
    await this.usage.checkAndRecord(userId, 'session')
    const baseUrl = await this.getProcessUrl(userId)
    const oc = await this.openCode.createSession(title, baseUrl) as { id: string }
    const pref = await this.models.getPreference(userId)
    const session = this.repo.create({ userId, openCodeSessionId: oc.id, title, modelConfigId: pref?.modelConfigId })
    return this.repo.save(session)
  }

  async sendMessage(id: string, userId: string, content: string) {
    await this.usage.checkAndRecord(userId, 'message')
    const session = await this.repo.findOneByOrFail({ id, userId })
    const baseUrl = await this.getProcessUrl(userId)
    const result = await this.openCode.sendMessage(session.openCodeSessionId, content, undefined, baseUrl)

    const estimatedTokens = Math.ceil(content.length / 4)
    session.tokenCount = (session.tokenCount ?? 0) + estimatedTokens
    await this.repo.save(session)

    if (session.modelConfigId) {
      const threshold = await this.models.getEffectiveThreshold(userId, session.modelConfigId)
      if (threshold && session.tokenCount / threshold.contextLimit >= threshold.compactAt) {
        await this.openCode.compact(session.openCodeSessionId, baseUrl)
        await this.repo.update(id, { tokenCount: 0 })
      }
    }

    return result
  }

  async listMessages(id: string, userId: string) {
    const session = await this.repo.findOneByOrFail({ id, userId })
    const baseUrl = await this.getProcessUrl(userId)
    const raw = await this.openCode.listMessages(session.openCodeSessionId, baseUrl) as { role: string; parts?: { type: string; text?: string }[] }[]
    return (Array.isArray(raw) ? raw : [])
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.parts?.find((p) => p.type === 'text')?.text ?? '',
      }))
      .filter((m) => m.content)
  }

  async remove(id: string, userId: string) {
    const session = await this.repo.findOneByOrFail({ id, userId })
    const baseUrl = await this.getProcessUrl(userId).catch(() => null)
    await this.openCode.deleteSession(session.openCodeSessionId, baseUrl ?? undefined).catch(() => null)
    await this.repo.delete({ id, userId })
  }

  streamEvents(id: string, userId: string) {
    return from(
      Promise.all([
        this.repo.findOneByOrFail({ id, userId }),
        this.getProcessUrl(userId),
      ])
    ).pipe(
      switchMap(([session, baseUrl]) =>
        this.openCode.streamSessionEvents(session.openCodeSessionId, baseUrl)
      ),
    )
  }
}
