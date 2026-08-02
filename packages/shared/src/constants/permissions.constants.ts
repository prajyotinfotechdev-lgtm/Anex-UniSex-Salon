export const PERMISSIONS = {
  CUSTOMER: {
    READ: 'Customer.Read',
    CREATE: 'Customer.Create',
    UPDATE: 'Customer.Update',
    DELETE: 'Customer.Delete',
    MANAGE: 'Customer.Manage',
  },
  EMPLOYEE: {
    READ: 'Employee.Read',
    CREATE: 'Employee.Create',
    UPDATE: 'Employee.Update',
    DELETE: 'Employee.Delete',
    MANAGE: 'Employee.Manage',
  },
  APPOINTMENT: {
    READ: 'Appointment.Read',
    CREATE: 'Appointment.Create',
    UPDATE: 'Appointment.Update',
    DELETE: 'Appointment.Delete',
  },
  SERVICE: {
    READ: 'Service.Read',
    CREATE: 'Service.Create',
    UPDATE: 'Service.Update',
    DELETE: 'Service.Delete',
    MANAGE: 'Service.Manage',
  },
  BRANCH: {
    READ: 'Branch.Read',
    CREATE: 'Branch.Create',
    UPDATE: 'Branch.Update',
    DELETE: 'Branch.Delete',
    MANAGE: 'Branch.Manage',
  },
  ORGANIZATION: {
    READ: 'Organization.Read',
    UPDATE: 'Organization.Update',
  },
  ROLE: {
    READ: 'Role.Read',
    CREATE: 'Role.Create',
    UPDATE: 'Role.Update',
    DELETE: 'Role.Delete',
  },
  REPORTS: {
    READ: 'Reports.Read',
  },
  BILLING: {
    READ: 'Billing.Read',
    CREATE: 'Billing.Create',
    MANAGE: 'Billing.Manage',
  },
} as const;

type ValueOf<T> = T[keyof T];
export type PermissionType = ValueOf<{
  [K in keyof typeof PERMISSIONS]: ValueOf<typeof PERMISSIONS[K]>
}>;
