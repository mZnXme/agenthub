import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { PresignOptions, StorageObjectRef } from './storage.types'

export async function getPresignedUploadUrl(
  client: S3Client,
  object: StorageObjectRef,
  options: PresignOptions = {},
) {
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: object.bucket,
      Key: object.key,
      ContentType: options.contentType,
    }),
    { expiresIn: options.expiresIn ?? 900 },
  )
}

export async function getPresignedDownloadUrl(
  client: S3Client,
  object: StorageObjectRef,
  options: PresignOptions = {},
) {
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: object.bucket, Key: object.key }),
    { expiresIn: options.expiresIn ?? 900 },
  )
}

export async function deleteObject(client: S3Client, object: StorageObjectRef) {
  await client.send(new DeleteObjectCommand({ Bucket: object.bucket, Key: object.key }))
}
