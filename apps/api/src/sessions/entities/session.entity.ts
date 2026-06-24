import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  openCodeSessionId: string

  @Column({ nullable: true })
  title?: string

  @Column({ nullable: true })
  modelConfigId?: string

  @Column({ default: 0 })
  tokenCount: number

  @Column({ type: 'text', nullable: true })
  compactSummary?: string

  @ManyToOne(() => User, (u) => u.sessions, { onDelete: 'CASCADE' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
