export type CreateFileAssetInput = {
  ownerId: string
  bucket: string
  objectKey: string
  filename: string
  mimeType: string
  size: number
  status: string
}

export abstract class FileAssetRepository {
  abstract create(data: CreateFileAssetInput): Promise<unknown>
  abstract findByOwner(id: string, ownerId: string, status?: string): Promise<unknown | null>
  abstract markUploaded(id: string): Promise<unknown>
  abstract remove(id: string): Promise<unknown>
}
