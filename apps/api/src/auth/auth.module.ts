import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { JwtGuard } from './guards/jwt.guard'

@Module({
  imports: [UsersModule],
  providers: [JwtGuard],
  exports: [JwtGuard],
})
export class AuthModule {}
