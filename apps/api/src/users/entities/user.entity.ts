import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm'
import { Session } from '../../sessions/entities/session.entity'
import { McpServerConfig } from '../../mcp/entities/mcp-server.entity'
import { ProviderConfig } from '../../providers/entities/provider.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  name: string

  @Column()
  passwordHash: string

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => Session, (s) => s.user)
  sessions: Session[]

  @OneToMany(() => McpServerConfig, (m) => m.user)
  mcpServers: McpServerConfig[]

  @OneToMany(() => ProviderConfig, (p) => p.user)
  providers: ProviderConfig[]
}
