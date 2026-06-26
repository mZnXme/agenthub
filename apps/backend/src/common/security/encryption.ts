import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

function keyFromSecret(secret: string) {
  return createHash('sha256').update(secret).digest()
}

export function encryptSecret(text: string, secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyFromSecret(secret), iv)
  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `v1:${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${ciphertext.toString('base64')}`
}

export function decryptSecret(encrypted: string, secret: string) {
  const [version, iv, authTag, ciphertext] = encrypted.split(':')
  if (version !== 'v1' || !iv || !authTag || !ciphertext) throw new Error('Invalid encrypted secret')
  const decipher = createDecipheriv('aes-256-gcm', keyFromSecret(secret), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
