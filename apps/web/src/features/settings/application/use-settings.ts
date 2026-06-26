'use client'

import { useEffect, useState } from 'react'
import { settingsService, type ModelConfig, type Preference } from '../infrastructure/settings.service'

export function useSettings() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [preference, setPreference] = useState<Preference>({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([settingsService.models(), settingsService.preference()])
      .then(([nextModels, nextPreference]) => { setModels(nextModels ?? []); setPreference(nextPreference ?? {}) })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  async function save(nextPreference = preference) {
    setError(null)
    await settingsService.savePreference(nextPreference)
    setPreference(nextPreference)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return { models, preference, setPreference, saved, error, save }
}
