import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import type { AuthUser, JwtPayload } from './auth.types';
import type { UserEntity } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByMobile(dto.mobile);

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, String(user.password));
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueSession(user);
    await this.userService.touchLastLogin(user.id);

    return tokens;
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user?.refreshTokenHash || !user.active) {
      throw new UnauthorizedException();
    }

    let isRefreshTokenValid = false;
    try {
      isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );
    } catch {
      throw new UnauthorizedException();
    }

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException();
    }

    return this.issueSession(user);
  }

  async logout(userId: number) {
    await this.userService.revokeTokens(userId);
    return { message: 'Logged out successfully' };
  }

  async me(userId: number): Promise<AuthUser> {
    const user = await this.userService.findById(userId);

    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    return this.userService.toAuthUser(user);
  }

  private async issueSession(user: UserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      mobile: user.mobile,
      tokenVersion: user.tokenVersion,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);
    await this.userService.updateRefreshToken(
      user.id,
      await bcrypt.hash(refreshToken, 10),
    );

    return {
      user: this.userService.toAuthUser(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async generateTokens(payload: JwtPayload) {
    const jwtSecret = String(ConfigService.config.jwt.SECRET);
    const refreshSecret = String(ConfigService.config.jwt.REFRESH_SECRET);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
