import { Observable } from 'rxjs'

export abstract class OpenCodeClientPort {
  abstract createSession(title?: string, baseUrl?: string): Promise<unknown>
  abstract deleteSession(id: string, baseUrl?: string): Promise<unknown>
  abstract sendMessage(sessionId: string, content: string, model?: string, effort?: string, baseUrl?: string): Promise<unknown>
  abstract listMessages(sessionId: string, baseUrl?: string): Promise<unknown>
  abstract compact(sessionId: string, baseUrl?: string): Promise<unknown>
  abstract addMcp(name: string, config: object, baseUrl?: string): Promise<unknown>
  abstract patchConfig(data: object, baseUrl?: string): Promise<unknown>
  abstract streamSessionEvents(openCodeSessionId: string, baseUrl?: string): Observable<{ data: string }>
}
