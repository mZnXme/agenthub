import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable } from 'rxjs'

@Injectable()
export class OpenCodeService {
  readonly defaultBaseUrl: string

  constructor(config: ConfigService) {
    this.defaultBaseUrl = config.get('OPENCODE_URL', 'http://localhost:4096')
  }

  private async request<T>(path: string, init?: RequestInit, baseUrl?: string): Promise<T> {
    const res = await fetch(`${baseUrl ?? this.defaultBaseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    if (!res.ok) throw new Error(`OpenCode error ${res.status}: ${await res.text()}`)
    return res.json() as Promise<T>
  }

  createSession(title?: string, baseUrl?: string) {
    return this.request('/session', { method: 'POST', body: JSON.stringify({ title }) }, baseUrl)
  }

  deleteSession(id: string, baseUrl?: string) {
    return this.request(`/session/${id}`, { method: 'DELETE' }, baseUrl)
  }

  sendMessage(sessionId: string, content: string, model?: string, baseUrl?: string) {
    return this.request(`/session/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ parts: [{ type: 'text', text: content }], model }),
    }, baseUrl)
  }

  listMessages(sessionId: string, baseUrl?: string) {
    return this.request(`/session/${sessionId}/message`, undefined, baseUrl)
  }

  compact(sessionId: string, baseUrl?: string) {
    return this.request(`/session/${sessionId}/compact`, { method: 'POST' }, baseUrl)
      .catch(() => null) // best-effort — not all OpenCode versions support this
  }

  addMcp(name: string, config: object, baseUrl?: string) {
    return this.request('/mcp', { method: 'POST', body: JSON.stringify({ name, config }) }, baseUrl)
  }

  getMcpStatus(baseUrl?: string) {
    return this.request('/mcp', undefined, baseUrl)
  }

  patchConfig(data: object, baseUrl?: string) {
    return this.request('/config', { method: 'PATCH', body: JSON.stringify(data) }, baseUrl)
  }

  streamSessionEvents(openCodeSessionId: string, baseUrl?: string): Observable<{ data: string }> {
    const url = `${baseUrl ?? this.defaultBaseUrl}/event`
    return new Observable((sub) => {
      const ctrl = new AbortController()
      fetch(url, { signal: ctrl.signal })
        .then(async (res) => {
          const reader = res.body!.getReader()
          const dec = new TextDecoder()
          let buf = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) { sub.complete(); break }
            buf += dec.decode(value, { stream: true })
            const lines = buf.split('\n')
            buf = lines.pop()!
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              try {
                const payload = JSON.parse(line.slice(6))
                if (payload.sessionId !== openCodeSessionId) continue
                sub.next({ data: line.slice(6) })
                if (payload.type === 'done') { sub.complete(); return }
              } catch { /* skip malformed */ }
            }
          }
        })
        .catch((err) => { if (err?.name !== 'AbortError') sub.error(err) })
      return () => ctrl.abort()
    })
  }
}
