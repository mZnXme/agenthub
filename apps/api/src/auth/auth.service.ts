import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { LoginDto, RegisterDto } from '@agenthub/types'

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email)
    if (existing) throw new ConflictException('Email already in use')
    const user = await this.users.create(dto)
    return this.issueTokens(user.id)
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')
    return this.issueTokens(user.id)
  }

  private issueTokens(userId: string) {
    const payload = { sub: userId }
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
    }
  }
}
