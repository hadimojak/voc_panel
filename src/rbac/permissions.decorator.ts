import { SetMetadata } from '@nestjs/common';
import type { Permission } from './permission';

export const PERMISSIONS_KEY = 'permissions';

/** Require the caller to have at least one of the listed permissions. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
