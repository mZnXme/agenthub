import { S3Client } from '@aws-sdk/client-s3'
import type { StorageClientConfig } from './storage.types'

export function createStorageClient(config: StorageClientConfig) {
  return new S3Client({
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}
