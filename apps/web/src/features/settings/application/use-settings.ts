'use client'

import { useEffect, useState } from 'react'
import { settingsService, type ModelConfig, type Preference, type UserModelOption } from '../infrastructure/settings.service'

export function useSettings() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [userModels, setUserModels] = useState<UserModelOption[]>([])
  const [preference, setPreference] = useState<Preference>({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([settingsService.models(), settingsService.userModels(), settingsService.preference()])
      .then(([nextModels, nextUserModels, nextPreference]) => { setModels(nextModels ?? []); setUserModels(nextUserModels ?? []); setPreference(nextPreference ?? {}) })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  async function save(nextPreference = preference) {
    setError(null)
    await settingsService.savePreference(nextPreference)
    setPreference(nextPreference)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return { models, userModels, preference, setPreference, saved, error, save }
}
