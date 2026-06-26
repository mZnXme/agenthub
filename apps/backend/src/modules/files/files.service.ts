import { Injectable } from '@nestjs/common'
import { FilesUseCases } from './application/use-cases/files.use-cases'

@Injectable()
export class FilesService {
  constructor(private readonly files: FilesUseCases) {}

  createUploadUrl(userId: string, input: { filename: string; mimeType: string; size: number }) {
    return this.files.createUploadUrl(userId, input)
  }

  confirm(userId: string, id: string) {
    return this.files.confirm(userId, id)
  }

  createDownloadUrl(userId: string, id: string) {
    return this.files.createDownloadUrl(userId, id)
  }

  remove(userId: string, id: string) {
    return this.files.remove(userId, id)
  }
}
