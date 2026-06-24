import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('user_model_preferences')
export class UserModelPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  userId: string

  @Column({ nullable: true })
  modelConfigId?: string

  @Column({ type: 'float', nullable: true })
  compactAt?: number
}
