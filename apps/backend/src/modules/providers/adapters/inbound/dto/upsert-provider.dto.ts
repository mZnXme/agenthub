import { IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator'

export class UpsertProviderDto {
  @IsString()
  @IsIn(['anthropic', 'openai', 'google', 'custom'])
  providerId: string

  @IsString()
  @MinLength(1)
  apiKey: string

  @IsOptional()
  @IsUrl({ require_tld: false })
  baseUrl?: string

  @IsOptional()
  @IsString()
  modelId?: string

  @IsOptional()
  @IsString()
  label?: string
}
