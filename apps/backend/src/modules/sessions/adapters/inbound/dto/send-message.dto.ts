import { IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  content: string

  @IsOptional()
  @IsString()
  modelConfigId?: string

  @IsOptional()
  @IsString()
  @IsIn(['auto', 'minimal', 'low', 'medium', 'high', 'max', 'xhigh'])
  effort?: string
}
