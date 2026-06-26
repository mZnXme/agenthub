import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import { FileAssetRepository } from '../../../../application/ports/database/files.repository.port'
import { ObjectStoragePort } from '../../../../application/ports/storage/object-storage.port'
import { UsageService } from '../../../usage/usage.service'

type FileAssetRecord = {
  id: string
  bucket: string
  objectKey: string
  filename: string
  mimeType: string
  size: number
  status: string
}

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'upload.bin'
}

@Injectable()
export class FilesUseCases {
  constructor(
    private readonly files: FileAssetRepository,
    private readonly storage: ObjectStoragePort,
    private readonly usage: UsageService,
    private readonly config: ConfigService,
  ) {}

  private bucket() {
    return this.config.get<string>('STORAGE_BUCKET', 'agenthub-local')
  }

  async createUploadUrl(userId: string, input: { filename: string; mimeType: string; size: number }) {
    await this.usage.checkFileUpload(userId, input.size)
    const filename = safeFilename(input.filename)
    const objectKey = `${userId}/${randomUUID()}-${filename}`
    const file = await this.files.create({
      ownerId: userId,
      bucket: this.bucket(),
      objectKey,
      filename,
      mimeType: input.mimeType,
      size: input.size,
      status: 'pending',
    }) as FileAssetRecord
    const uploadUrl = await this.storage.getUploadUrl({ bucket: file.bucket, key: file.objectKey }, { contentType: file.mimeType, expiresIn: 900 })
    return { file, uploadUrl, method: 'PUT', expiresIn: 900, headers: { 'Content-Type': file.mimeType } }
  }

  async confirm(userId: string, id: string) {
    const file = await this.files.findByOwner(id, userId) as FileAssetRecord | null
    if (!file) throw new NotFoundException('File not found')
    if (file.status !== 'uploaded') await this.usage.recordFileUpload(userId, file.size)
    return this.files.markUploaded(id)
  }

  async createDownloadUrl(userId: string, id: string) {
    const file = await this.files.findByOwner(id, userId, 'uploaded') as FileAssetRecord | null
    if (!file) throw new NotFoundException('File not found')
    const downloadUrl = await this.storage.getDownloadUrl({ bucket: file.bucket, key: file.objectKey }, { expiresIn: 900 })
    return { file, downloadUrl, expiresIn: 900 }
  }

  async remove(userId: string, id: string) {
    const file = await this.files.findByOwner(id, userId) as FileAssetRecord | null
    if (!file) throw new NotFoundException('File not found')
    await this.storage.delete({ bucket: file.bucket, key: file.objectKey }).catch(() => null)
    await this.files.remove(id)
  }
}
