import { Injectable } from '@nestjs/common'
import { FirebaseUserData, UsersRepositoryPort } from '../../../../application/ports/database/users.repository.port'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaUsersRepository implements UsersRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } })
  }

  createFirebaseUser(data: FirebaseUserData) {
    return this.prisma.user.create({ data })
  }

  updateProfile(id: string, data: { name: string; picture?: string | null }) {
    return this.prisma.user.update({ where: { id }, data })
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}
