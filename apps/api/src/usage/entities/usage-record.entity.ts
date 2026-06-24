import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity('usage_records')
@Unique(['userId', 'date'])
export class UsageRecord {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() userId: string
  @Column() date: string   // 'YYYY-MM-DD'
  @Column({ default: 0 }) messageCount: number
  @Column({ default: 0 }) sessionCount: number
  @Column({ default: 0 }) fileUploadCount: number
  @Column({ default: 0 }) storageUsedMb: number
}
