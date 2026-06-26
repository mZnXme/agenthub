'use client'

import { useEffect, useState, useTransition } from 'react'
import { mcpService, type McpCatalogItem, type McpServer } from '../infrastructure/mcp.service'

export function useMcpServers() {
  const [servers, setServers] = useState<McpServer[]>([])
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function refresh() {
    const [nextServers, nextCatalog] = await Promise.all([mcpService.list(), mcpService.catalog()])
    startTransition(() => {
      setServers(nextServers)
      setCatalog(nextCatalog)
    })
  }

  useEffect(() => { refresh().catch((e) => setError(e instanceof Error ? e.message : String(e))) }, [])

  async function install(slug: string, secrets: Record<string, string>) {
    setError(null)
    const server = await mcpService.install(slug, { secrets, enabled: true })
    setServers((prev) => [...prev, server])
  }

  async function add(data: Parameters<typeof mcpService.add>[0]) {
    setError(null)
    const server = await mcpService.add(data)
    setServers((prev) => [...prev, server])
  }

  async function toggle(id: string, enabled: boolean) {
    setError(null)
    await mcpService.update(id, { enabled })
    setServers((prev) => prev.map((server) => server.id === id ? { ...server, enabled } : server))
  }

  async function remove(id: string) {
    setError(null)
    await mcpService.remove(id)
    setServers((prev) => prev.filter((server) => server.id !== id))
  }

  return { servers, catalog, error, isPending, install, add, toggle, remove }
}
