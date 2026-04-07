import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/application/users.service';
import { JWT_EXPIRES_SECONDS } from '../auth.constants';
import { JwtPayload } from '../domain/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmailForAuth(email);
    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: JWT_EXPIRES_SECONDS,
      }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
