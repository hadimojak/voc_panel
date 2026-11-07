import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import type {
  AuthenticatedRequest,
  RefreshAuthenticatedRequest,
} from './auth.types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Sign in with mobile and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Returns user { id, fullName, mobile, role, permissions } plus tokens',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Refresh token in the format: Bearer <token>',
    required: true,
  })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  refresh(@Req() req: RefreshAuthenticatedRequest) {
    return this.authService.refresh(req.user.userId, req.user.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Access token in the format: Bearer <token>',
    required: true,
  })
  @ApiOperation({ summary: 'Sign out and revoke refresh token' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Current session user (id, fullName, mobile, role, permissions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — treat as logged out',
  })
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.userId);
  }
}
