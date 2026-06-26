import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersRepositoryPort } from '../../application/ports/database/users.repository.port'
import { PrismaUsersRepository } from '../../adapters/outbound/database/repositories/users.repository'
import { UsersUseCases } from './application/use-cases/users.use-cases'

@Module({
  providers: [
    UsersService,
    UsersUseCases,
    { provide: UsersRepositoryPort, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
