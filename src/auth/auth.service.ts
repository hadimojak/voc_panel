import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const exists = await this.userService.findByUsername(dto.username);

    if (exists) {
      throw new ConflictException('Username already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.create({
      username: dto.username,
      password: hashed,
    });

    return this.generateTokens(user.id, user.username);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.username);

    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user.id, user.username);

    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.userService.updateRefreshToken(userId, null);

    return { message: 'Logged out successfully' };
  }

  async generateTokens(userId: number, username: string) {
    const payload = {
      sub: userId,
      username,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'access-secret',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
