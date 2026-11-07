import { UserRole } from '../user/user.entity';
import {
  hasPermission,
  permissionsOf,
  PERMISSIONS,
} from './permission';

describe('RBAC matrix', () => {
  it('gives admin every permission', () => {
    expect(permissionsOf(UserRole.admin)).toEqual([...PERMISSIONS]);
  });

  it('denies admin.manage to agent and supervisor', () => {
    expect(hasPermission(UserRole.agent, 'admin.manage')).toBe(false);
    expect(hasPermission(UserRole.supervisor, 'admin.manage')).toBe(false);
  });

  it('allows tickets.view to all built-in roles', () => {
    for (const role of Object.values(UserRole)) {
      expect(hasPermission(role, 'tickets.view')).toBe(true);
    }
  });
});
