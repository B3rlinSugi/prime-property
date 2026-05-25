export type Role = 'ADMIN' | 'SUPERADMIN';

export const PERMISSIONS = {
  ADMIN: {
    canViewProperties: true,
    canFilterProperties: true,
    canViewPropertyDetail: true,
    canCreateProperty: false,
    canUpdateProperty: false,
    canDeleteProperty: false,
    canManageUsers: false,
    canViewAuditLog: false,
  },
  SUPERADMIN: {
    canViewProperties: true,
    canFilterProperties: true,
    canViewPropertyDetail: true,
    canCreateProperty: true,
    canUpdateProperty: true,
    canDeleteProperty: true,
    canManageUsers: true,
    canViewAuditLog: true,
  },
} as const;

export function hasPermission(role: Role, permission: keyof typeof PERMISSIONS.ADMIN): boolean {
  return PERMISSIONS[role]?.[permission] ?? false;
}

export function isSuperadmin(role: string): boolean {
  return role === 'SUPERADMIN';
}
