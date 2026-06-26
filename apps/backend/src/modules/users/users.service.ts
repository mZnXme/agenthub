import { Injectable } from '@nestjs/common'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { UsersUseCases } from './application/use-cases/users.use-cases'

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersUseCases) {}

  upsertFirebaseUser(decoded: DecodedIdToken) {
    return this.users.upsertFirebaseUser({
      firebaseUid: decoded.uid,
      email: decoded.email ?? `${decoded.uid}@firebase.local`,
      name: decoded.name ?? decoded.email ?? 'Firebase user',
      picture: decoded.picture ?? null,
    })
  }

  findById(id: string) {
    return this.users.findById(id)
  }
}
