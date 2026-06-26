'use client'

import { useEffect, useState } from 'react'
import { providersService, type Provider, type ProviderConnectState } from '../infrastructure/providers.service'

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connectState, setConnectState] = useState<ProviderConnectState | null>(null)
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

  async function connect(providerId: string) {
    setConnecting(providerId)
    setError(null)
    try {
      const state = await providersService.connect(providerId)
      setConnectState(state)
      return state
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      throw e
    } finally {
      setConnecting(null)
    }
  }

  async function checkConnect(providerId: string) {
    const state = await providersService.connectStatus(providerId)
    setConnectState(state)
    if (state.status === 'connected') await refresh()
    return state
  }

  return { providers, saving, connecting, connectState, error, upsert, remove, connect, checkConnect }
}
