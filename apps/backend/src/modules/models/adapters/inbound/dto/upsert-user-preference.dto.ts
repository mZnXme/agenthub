import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpsertUserPreferenceDto {
  @IsOptional()
  @IsString()
  modelConfigId?: string

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1)
  compactAt?: number
}
