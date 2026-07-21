import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './auth.types';
import type { UserEntity } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);

    if (!user) throw new UnauthorizedException();

    const hashedPassword = String(user.password);
    const isMatch = await bcrypt.compare(dto.password, hashedPassword);
    if (!isMatch) throw new UnauthorizedException();

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(user.id, refreshHash);

    return {
      user: this.toAuthUser(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user?.refreshTokenHash) {
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

    if (!isRefreshTokenValid) throw new UnauthorizedException();

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(payload);

    await this.userService.updateRefreshToken(
      user.id,
      await bcrypt.hash(newRefreshToken, 10),
    );

    return {
      user: this.toAuthUser(user),
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await this.userService.revokeTokens(userId);
    return { message: 'Logged out successfully' };
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

  private toAuthUser(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
}
