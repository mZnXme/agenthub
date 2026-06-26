import { Injectable } from '@nestjs/common'
import { FirebaseUserData, UsersRepositoryPort } from '../../../../application/ports/database/users.repository.port'

type UserRecord = FirebaseUserData & { id: string; name: string; picture?: string | null }

@Injectable()
export class UsersUseCases {
  constructor(private readonly users: UsersRepositoryPort) {}

  async upsertFirebaseUser(data: FirebaseUserData) {
    const existing = await this.users.findByFirebaseUid(data.firebaseUid) as UserRecord | null
    const user = existing ?? await this.users.findByEmail(data.email) as UserRecord | null
    if (!user) return this.users.createFirebaseUser(data)
    if (!existing) await this.users.linkFirebaseUid(user.id, data.firebaseUid)
    return this.users.updateProfile(user.id, {
      name: data.name ?? user.name,
      picture: data.picture ?? user.picture,
    })
  }

  findById(id: string) {
    return this.users.findById(id)
  }
}
