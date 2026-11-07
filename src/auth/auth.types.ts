import type { Request } from 'express';
import type { Permission } from '../rbac/permission';
import type { UserRole } from '../user/user.entity';

export type AuthUser = {
  id: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  /** Effective permissions from the دسترسی‌ها RBAC matrix. */
  permissions: Permission[];
};

export type JwtPayload = {
  sub: number;
  mobile: string;
  tokenVersion: number;
};

export type AuthenticatedUser = {
  userId: number;
  fullName: string;
  mobile: string;
  role: UserRole;
};

export type RefreshAuthenticatedUser = {
  userId: number;
  mobile: string;
  refreshToken: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

export type RefreshAuthenticatedRequest = Request & {
  user: RefreshAuthenticatedUser;
};
