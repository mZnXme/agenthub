import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('user_plans')
export class UserPlan {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) userId: string
  @Column() planId: string
  @Column({ nullable: true, type: 'text' }) validUntil?: string
  @CreateDateColumn() createdAt: Date
}
