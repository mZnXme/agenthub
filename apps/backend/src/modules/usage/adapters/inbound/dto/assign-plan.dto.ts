import { IsOptional, IsString } from 'class-validator'

export class AssignPlanDto {
  @IsString()
  planSlug: string

  @IsOptional()
  @IsString()
  userId?: string
}
