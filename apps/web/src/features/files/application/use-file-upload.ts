'use client'

import { useState } from 'react'
import { filesService, type FileAsset } from '../infrastructure/files.service'

export function useFileUpload() {
  const [files, setFiles] = useState<FileAsset[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const ticket = await filesService.createUploadUrl(file)
      await fetch(ticket.uploadUrl, { method: ticket.method, headers: ticket.headers, body: file })
      const confirmed = await filesService.confirm(ticket.file.id)
      setFiles((current) => [...current, confirmed])
      return confirmed
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      throw e
    } finally {
      setUploading(false)
    }
  }

  return { files, uploading, error, upload }
}
