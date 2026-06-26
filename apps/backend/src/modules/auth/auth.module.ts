import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { AdminGuard } from '../../common/guards/admin.guard'
import { JwtGuard } from '../../common/guards/jwt.guard'

@Module({
  imports: [UsersModule],
  providers: [JwtGuard, AdminGuard],
  exports: [JwtGuard, AdminGuard],
})
export class AuthModule {}
