import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Skill } from './entities/skill.entity'
import { UserSkill } from './entities/user-skill.entity'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Skill, UserSkill]), UsersModule],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
