import { Injectable } from '@nestjs/common'
import { FirebaseUserData, UsersRepositoryPort } from '../../../../application/ports/database/users.repository.port'

type UserRecord = FirebaseUserData & { id: string; name: string; picture?: string | null }

@Injectable()
export class UsersUseCases {
  constructor(private readonly users: UsersRepositoryPort) {}

  async upsertFirebaseUser(data: FirebaseUserData) {
    const existing = await this.users.findByFirebaseUid(data.firebaseUid) as UserRecord | null
    if (!existing) return this.users.createFirebaseUser(data)
    return this.users.updateProfile(existing.id, {
      name: data.name ?? existing.name,
      picture: data.picture ?? existing.picture,
    })
  }

  findById(id: string) {
    return this.users.findById(id)
  }
}
