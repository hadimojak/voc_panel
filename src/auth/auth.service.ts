import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

type TokenPayload = {
  sub: number;
  username: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userService.findByUsername(dto.username);
    if (existingUser) throw new ConflictException('Username already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      username: dto.username,
      password: hashedPassword,
    });

    return {
      id: user.id,
      username: user.username,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);

    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(user.id, refreshHash);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(userId: number, refreshToken: string) {
    console.log("herrreee");
    
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) throw new UnauthorizedException();

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(payload);

    await this.userService.updateRefreshToken(
      user.id,
      await bcrypt.hash(newRefreshToken, 10),
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await this.userService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: ConfigService.config.jwt.SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: ConfigService.config.jwt.REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
