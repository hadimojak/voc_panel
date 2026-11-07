import { UserRole } from '../user/user.entity';

/**
 * Mirrors smart-dashboard `src/modules/auth/domain/permission.ts`
 * (صفحه دسترسی‌ها / RolesPage matrix).
 */
export const PERMISSIONS = [
  'dashboard.view',
  'tickets.view',
  'calls.view',
  'calls.receive',
  'customers.view',
  'admin.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** RBAC matrix — change access rules here only (same as frontend). */
export const rolePermissions: Record<UserRole, readonly Permission[]> = {
  [UserRole.agent]: [
    'dashboard.view',
    'tickets.view',
    'calls.view',
    'calls.receive',
    'customers.view',
  ],
  [UserRole.supervisor]: [
    'dashboard.view',
    'tickets.view',
    'calls.view',
    'calls.receive',
    'customers.view',
  ],
  [UserRole.admin]: PERMISSIONS,
};

export const hasPermission = (
  role: UserRole,
  permission: Permission,
): boolean => rolePermissions[role]?.includes(permission) ?? false;

export const permissionsOf = (role: UserRole): readonly Permission[] =>
  rolePermissions[role] ?? [];

export const hasAnyPermission = (
  role: UserRole,
  required: readonly Permission[],
): boolean => required.some((permission) => hasPermission(role, permission));
