import { IsInt, IsString, MaxLength, Min } from 'class-validator'

export class CreateUploadUrlDto {
  @IsString()
  @MaxLength(255)
  filename: string

  @IsString()
  @MaxLength(120)
  mimeType: string

  @IsInt()
  @Min(1)
  size: number
}
