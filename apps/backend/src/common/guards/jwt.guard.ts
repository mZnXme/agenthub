import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { admin } from '../../modules/auth/firebase-admin'
import { UsersService } from '../../modules/users/users.service'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly users: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const token: string | undefined = req.headers['authorization']?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException()
    try {
      const decoded = await admin.auth().verifyIdToken(token)
      req.user = await this.users.upsertFirebaseUser(decoded)
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}
