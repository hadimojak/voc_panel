import type { Request } from 'express';
import type { UserRole } from '../user/user.entity';

export type JwtPayload = {
  sub: number;
  username: string;
  tokenVersion: number;
};

export type AuthenticatedUser = {
  userId: number;
  username: string;
  role: UserRole;
};

export type RefreshAuthenticatedUser = {
  userId: number;
  username: string;
  refreshToken: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

export type RefreshAuthenticatedRequest = Request & {
  user: RefreshAuthenticatedUser;
};
