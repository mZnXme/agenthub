import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity'
import { RegisterDto } from '@agenthub/types'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = this.repo.create({ email: dto.email, name: dto.name, passwordHash })
    return this.repo.save(user)
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email })
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }
}
