import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) slug: string   // 'free' | 'pro'
  @Column() name: string
  @Column({ default: 30 })   maxMessagesPerDay: number   // -1 = unlimited
  @Column({ default: 3 })    maxSessionsPerDay: number
  @Column({ default: 5 })    maxActiveSessions: number
  @Column({ default: 2 })    maxMcpServers: number
  @Column({ default: 3 })    maxSkills: number
  @Column({ default: 5 })    maxFileUploadsPerDay: number
  @Column({ default: 5 })    maxFileSizeMb: number
  @Column({ default: 50 })   storageLimitMb: number
}
