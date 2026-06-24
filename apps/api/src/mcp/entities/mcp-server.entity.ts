import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity('mcp_servers')
export class McpServerConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  name: string

  @Column({ default: 'stdio' })
  transport: string

  @Column({ nullable: true })
  command?: string

  @Column({ type: 'simple-json', nullable: true })
  args?: string[]

  @Column({ nullable: true })
  url?: string

  @Column({ type: 'simple-json', nullable: true })
  env?: Record<string, string>

  @Column({ default: true })
  enabled: boolean

  @ManyToOne(() => User, (u) => u.mcpServers, { onDelete: 'CASCADE' })
  user: User
}
