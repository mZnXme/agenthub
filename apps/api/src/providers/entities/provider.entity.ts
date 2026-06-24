import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity('provider_configs')
export class ProviderConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  providerId: string   // 'anthropic' | 'openai' | 'google' | 'custom'

  @Column()
  apiKeyEncrypted: string

  @Column({ nullable: true })
  baseUrl?: string

  @Column({ nullable: true })
  modelId?: string

  @Column({ nullable: true })
  label?: string

  @ManyToOne(() => User, (u) => u.providers, { onDelete: 'CASCADE' })
  user: User
}
