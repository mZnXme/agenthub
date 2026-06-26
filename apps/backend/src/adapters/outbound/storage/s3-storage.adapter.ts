import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createStorageClient, deleteObject, getPresignedDownloadUrl, getPresignedUploadUrl } from '@agenthub/storage'
import { ObjectStoragePort, StoredObject } from '../../../application/ports/storage/object-storage.port'

@Injectable()
export class MinioObjectStorageAdapter implements ObjectStoragePort {
  private readonly client

  constructor(config: ConfigService) {
    this.client = createStorageClient({
      endpoint: config.get<string>('STORAGE_ENDPOINT'),
      region: config.get<string>('STORAGE_REGION', 'us-east-1'),
      accessKeyId: config.get<string>('STORAGE_ACCESS_KEY', 'minioadmin'),
      secretAccessKey: config.get<string>('STORAGE_SECRET_KEY', 'minioadmin'),
      forcePathStyle: config.get<string>('STORAGE_FORCE_PATH_STYLE', 'true') !== 'false',
    })
  }

  getUploadUrl(object: StoredObject, options: { contentType: string; expiresIn: number }) {
    return getPresignedUploadUrl(this.client, object, options)
  }

  getDownloadUrl(object: StoredObject, options: { expiresIn: number }) {
    return getPresignedDownloadUrl(this.client, object, options)
  }

  async delete(object: StoredObject) {
    await deleteObject(this.client, object)
  }
}
