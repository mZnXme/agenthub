import { apiClient } from '@/lib/api/client'

export interface FileAsset { id: string; filename: string; mimeType: string; size: number; status: string }

export interface UploadTicket {
  file: FileAsset
  uploadUrl: string
  method: 'PUT'
  expiresIn: number
  headers: Record<string, string>
}

export const filesService = {
  createUploadUrl: (file: File) => apiClient.post<UploadTicket>('/api/files/upload-url', {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
  }),
  confirm: (id: string) => apiClient.post<FileAsset>(`/api/files/${id}/confirm`, {}),
}
