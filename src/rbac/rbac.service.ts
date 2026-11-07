import { Injectable } from '@nestjs/common';
import { UserRole } from '../user/user.entity';
import {
  PERMISSIONS,
  permissionsOf,
  type Permission,
} from './permission';
import {
  permissionLabels,
  roleDescriptions,
  roleLabels,
} from './rbac.labels';

export type RbacPermissionItem = {
  key: Permission;
  label: string;
};

export type RbacRoleDefinition = {
  id: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  system: true;
  baseRole: UserRole;
};

/** System roles only — same matrix as smart-dashboard دسترسی‌ها. */
@Injectable()
export class RbacService {
  listPermissions(): RbacPermissionItem[] {
    return PERMISSIONS.map((key) => ({
      key,
      label: permissionLabels[key],
    }));
  }

  listRoles(): RbacRoleDefinition[] {
    return (Object.values(UserRole) as UserRole[]).map((role) => ({
      id: role,
      name: roleLabels[role],
      description: roleDescriptions[role],
      permissions: [...permissionsOf(role)],
      system: true as const,
      baseRole: role,
    }));
  }
}
