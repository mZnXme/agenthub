export interface StorageClientConfig {
  endpoint?: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle?: boolean
}

export interface StorageObjectRef {
  bucket: string
  key: string
}

export interface PresignOptions {
  expiresIn?: number
  contentType?: string
}
