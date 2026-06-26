export type StoredObject = { bucket: string; key: string }

export abstract class ObjectStoragePort {
  abstract getUploadUrl(object: StoredObject, options: { contentType: string; expiresIn: number }): Promise<string>
  abstract getDownloadUrl(object: StoredObject, options: { expiresIn: number }): Promise<string>
  abstract delete(object: StoredObject): Promise<void>
}
