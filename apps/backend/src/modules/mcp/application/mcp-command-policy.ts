import { BadRequestException, Injectable } from '@nestjs/common'
import { MCP_CATALOG } from './mcp-catalog'
import { McpServerInput } from './mcp.types'

function sameArgs(left?: string[] | null, right?: string[]) {
  const a = left ?? []
  const b = right ?? []
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function isSafeRemoteUrl(url?: string | null) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

@Injectable()
export class McpCommandPolicy {
  assertAllowed(input: McpServerInput) {
    const transport = input.transport ?? 'stdio'
    if (!['stdio', 'sse', 'http'].includes(transport)) {
      throw new BadRequestException('Unsupported MCP transport')
    }

    if (transport !== 'stdio') {
      if (!isSafeRemoteUrl(input.url)) throw new BadRequestException('Remote MCP URL must be HTTPS')
      return
    }

    const matched = MCP_CATALOG.some((item) =>
      item.transport === 'stdio'
      && item.command === input.command
      && sameArgs(input.args, item.args),
    )
    if (!matched) {
      throw new BadRequestException('MCP stdio command is not in the AgentHub allowlist')
    }
  }
}
