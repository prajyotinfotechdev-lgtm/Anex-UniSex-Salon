export const PERMISSIONS = {
  // Add base permissions here as needed
  DASHBOARD: {
    READ: 'DASHBOARD_READ',
  },
  SETTINGS: {
    READ: 'SETTINGS_READ',
    WRITE: 'SETTINGS_WRITE',
  },
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];
