import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import type { JwtPayload, RefreshAuthenticatedUser } from './auth.types';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly userService: UserService) {
    const refreshSecret = String(ConfigService.config.jwt.REFRESH_SECRET);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: refreshSecret,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<RefreshAuthenticatedUser> {
    const refreshToken = req.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Token version is invalid');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      refreshToken,
    };
  }
}
