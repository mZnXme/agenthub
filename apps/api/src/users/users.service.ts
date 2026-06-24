import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async upsertFirebaseUser(decoded: DecodedIdToken): Promise<User> {
    let user = await this.repo.findOneBy({ firebaseUid: decoded.uid })
    if (!user) {
      user = this.repo.create({
        firebaseUid: decoded.uid,
        email: decoded.email!,
        name: decoded.name ?? decoded.email!,
        picture: decoded.picture ?? null,
      })
    } else {
      user.name = decoded.name ?? user.name
      user.picture = decoded.picture ?? user.picture
    }
    return this.repo.save(user)
  }

  findById(id: string) {
    return this.repo.findOneBy({ id })
  }
}
