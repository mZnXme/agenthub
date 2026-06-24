import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) slug: string
  @Column() name: string
  @Column({ nullable: true }) description?: string
  @Column({ type: 'text', nullable: true }) configJson?: string

  get config() { return this.configJson ? JSON.parse(this.configJson) : {} }
}
