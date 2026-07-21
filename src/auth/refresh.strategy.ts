import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import type { JwtPayload, RefreshAuthenticatedUser } from './auth.types';

type RequestWithHeaders = {
  headers?: {
    authorization?: string | string[];
  };
};

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
    req: RequestWithHeaders,
    payload: JwtPayload,
  ): Promise<RefreshAuthenticatedUser> {
    const authorizationHeader = Array.isArray(req.headers?.authorization)
      ? req.headers.authorization[0]
      : req.headers?.authorization;
    const refreshToken = authorizationHeader?.replace(/^Bearer\s+/i, '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const user = await this.userService.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      refreshToken,
    };
  }
}
