'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFileUpload } from '@/features/files/application/use-file-upload'
import { providersService } from '@/features/providers/infrastructure/providers.service'
import { settingsService, type Preference, type UserModelOption } from '@/features/settings/infrastructure/settings.service'
import { usageService, type UsageData } from '@/features/usage/infrastructure/usage.service'
import { streamEvents } from '../infrastructure/events.service'
import { messagesService, type Message } from '../infrastructure/messages.service'
import { sessionsService, type Session } from '../infrastructure/sessions.service'

export function useChatSession(sessionId: string) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [hasProvider, setHasProvider] = useState(false)
  const [models, setModels] = useState<UserModelOption[]>([])
  const [modelName, setModelName] = useState('')
  const [modelPreference, setModelPreference] = useState<Preference>({})
  const [effort, setEffort] = useState('auto')
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [limitMsg, setLimitMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileUpload = useFileUpload()

  useEffect(() => {
    sessionsService.list().then(setSessions)
    providersService.list().then((items) => setHasProvider(items.some((provider) => provider.connectedViaOpenCode || provider.apiKeyMasked))).catch(() => setHasProvider(false))
    Promise.all([settingsService.userModels(), settingsService.preference()])
      .then(([modelList, preference]) => {
        const enabledModels = (modelList ?? []).filter((model) => model.enabled)
        setModels(enabledModels)
        setModelPreference(preference ?? {})
        setModelName(preference?.modelName && enabledModels.some((model) => model.id === preference.modelName) ? preference.modelName : '')
      })
      .catch(() => null)
    usageService.get().then(setUsage).catch(() => null)
  }, [])

  useEffect(() => {
    if (!sessionId) return
    setMessages([])
    messagesService.list(sessionId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
  }, [sessionId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function newChat() {
    if (creating) return
    if (!hasProvider) {
      router.push('/providers')
      return
    }
    setCreating(true)
    try {
      const session = await sessionsService.create()
      setSessions((prev) => [session, ...prev])
      router.push(`/chat/${session.id}`)
    } catch (e) {
      setLimitMsg(e instanceof Error ? e.message : 'Session limit reached')
    } finally {
      setCreating(false)
    }
  }

  async function deleteSession(id: string) {
    await sessionsService.remove(id)
    const remaining = sessions.filter((session) => session.id !== id)
    setSessions(remaining)
    if (id === sessionId) {
      if (remaining.length > 0) router.push(`/chat/${remaining[0].id}`)
      else router.push('/chat')
    }
  }

  async function send() {
    if (!input.trim() || !sessionId || loading) return
    if (!hasProvider) {
      setLimitMsg('Add an AI provider before sending messages.')
      return
    }
    const content = input
    setMessages((current) => [...current, { role: 'user', content }])
    setInput('')
    setLoading(true)
    try {
      void messagesService.send(sessionId, content, { modelName: modelName || undefined, effort })
      setMessages((current) => [...current, { role: 'assistant', content: '' }])
      await streamEvents(sessionId, (text) =>
        setMessages((current) => {
          const copy = [...current]
          copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + text }
          return copy
        }),
      )
      usageService.get().then(setUsage).catch(() => null)
    } catch (e) {
      setLimitMsg(e instanceof Error ? e.message : 'Message limit reached')
    } finally {
      setLoading(false)
    }
  }

  async function attachFile(file: File) {
    const uploaded = await fileUpload.upload(file)
    setInput((current) => `${current}${current ? '\n' : ''}[Attached file: ${uploaded.filename}]`)
  }

  function selectModel(nextModelName: string) {
    setModelName(nextModelName)
    const nextPreference = { ...modelPreference, modelName: nextModelName || undefined }
    setModelPreference(nextPreference)
    settingsService.savePreference(nextPreference).catch(() => null)
  }

  return {
    sessions, messages, input, setInput, loading, creating, hasProvider, models, modelName, selectModel, effort, setEffort, usage, limitMsg, setLimitMsg, bottomRef,
    newChat, deleteSession, send, attachFile, fileUpload,
  }
}
