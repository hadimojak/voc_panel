import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import type { AuthenticatedUser, JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    const jwtSecret = String(ConfigService.config.jwt.SECRET);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      username: payload.username,
      email: user.email,
      role: user.role,
    };
  }
}
