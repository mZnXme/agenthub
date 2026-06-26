import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateModelConfigDto {
  @IsString()
  name: string

  @IsNumber()
  @Min(1)
  contextLimit: number

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1)
  compactAt?: number
}
