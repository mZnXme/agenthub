const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export async function streamEvents(
  sessionId: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const token = localStorage.getItem('token') ?? ''
  const res = await fetch(`${BASE}/api/sessions/${sessionId}/stream`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const reader = res.body!.getReader()
  const dec = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()!
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const event = JSON.parse(line.slice(6))
        const text = (event.parts as { type: string; text?: string }[] | undefined)
          ?.find((p) => p.type === 'text')?.text
        if (text) onChunk(text)
      } catch { /* skip malformed */ }
    }
  }
}
