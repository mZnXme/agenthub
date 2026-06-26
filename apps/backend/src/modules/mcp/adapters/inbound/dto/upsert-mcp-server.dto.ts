import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString } from 'class-validator'

export class UpsertMcpServerDto {
  @IsOptional()
  @IsString()
  catalogSlug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsIn(['stdio', 'sse', 'http'])
  transport?: string

  @IsOptional()
  @IsString()
  command?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  args?: string[]

  @IsOptional()
  @IsString()
  url?: string

  @IsOptional()
  @IsObject()
  env?: Record<string, string>

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>

  @IsOptional()
  @IsObject()
  secrets?: Record<string, string>

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}
