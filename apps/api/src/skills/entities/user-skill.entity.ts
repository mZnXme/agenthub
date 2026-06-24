import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('user_skills')
@Unique(['userId', 'skillId'])
export class UserSkill {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() userId: string
  @Column() skillId: string
  @Column({ default: false }) enabled: boolean
}
