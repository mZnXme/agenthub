'use client'

import { useEffect, useState } from 'react'
import { providersService, type Provider } from '../infrastructure/providers.service'

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() { setProviders(await providersService.list()) }
  useEffect(() => { refresh().catch((e) => setError(e instanceof Error ? e.message : String(e))) }, [])

  async function upsert(data: Parameters<typeof providersService.upsert>[0]) {
    setSaving(true)
    setError(null)
    try {
      await providersService.upsert(data)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    setError(null)
    await providersService.remove(id)
    setProviders((current) => current.filter((provider) => provider.id !== id))
  }

  return { providers, saving, error, upsert, remove }
}
