import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { decryptSecret, encryptSecret } from '../../../common/security/encryption'

type SecretMap = Record<string, string>

@Injectable()
export class McpSecretVault {
  constructor(private readonly config: ConfigService) {}

  private encryptionSecret() {
    return this.config.get<string>('APP_ENCRYPTION_KEY', 'dev-only-change-me')
  }

  encryptMany(values?: SecretMap | null): SecretMap | undefined {
    if (!values) return undefined
    const encrypted = Object.entries(values)
      .filter(([, value]) => value.trim().length > 0)
      .map(([key, value]) => [key, encryptSecret(value, this.encryptionSecret())])
    return encrypted.length ? Object.fromEntries(encrypted) : undefined
  }

  decryptMany(values?: unknown): SecretMap {
    if (!values || typeof values !== 'object' || Array.isArray(values)) return {}
    return Object.fromEntries(
      Object.entries(values as SecretMap).map(([key, value]) => [key, decryptSecret(value, this.encryptionSecret())]),
    )
  }

  maskKeys(values?: unknown): string[] {
    if (!values || typeof values !== 'object' || Array.isArray(values)) return []
    return Object.keys(values)
  }

  resolveTemplates(values: Record<string, string> | undefined, secrets: SecretMap) {
    if (!values) return undefined
    return Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name: string) => secrets[name] ?? ''),
      ]),
    )
  }
}
