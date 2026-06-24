import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('model_configs')
export class ModelConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  contextLimit: number

  @Column({ type: 'float', default: 0.8 })
  compactAt: number

  @CreateDateColumn()
  createdAt: Date
}
