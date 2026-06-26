import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator'

export class InstallCatalogMcpDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @IsOptional()
  @IsObject()
  secrets?: Record<string, string>
}
