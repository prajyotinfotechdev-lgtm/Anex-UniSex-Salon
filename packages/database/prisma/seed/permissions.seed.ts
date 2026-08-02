import { PrismaClient } from '@prisma/client';

const PERMISSIONS = {
  CUSTOMER: { READ: 'Customer.Read', CREATE: 'Customer.Create', UPDATE: 'Customer.Update', DELETE: 'Customer.Delete', MANAGE: 'Customer.Manage' },
  EMPLOYEE: { READ: 'Employee.Read', CREATE: 'Employee.Create', UPDATE: 'Employee.Update', DELETE: 'Employee.Delete', MANAGE: 'Employee.Manage' },
  APPOINTMENT: { READ: 'Appointment.Read', CREATE: 'Appointment.Create', UPDATE: 'Appointment.Update', DELETE: 'Appointment.Delete' },
  SERVICE: { READ: 'Service.Read', CREATE: 'Service.Create', UPDATE: 'Service.Update', DELETE: 'Service.Delete', MANAGE: 'Service.Manage' },
  BRANCH: { READ: 'Branch.Read', CREATE: 'Branch.Create', UPDATE: 'Branch.Update', DELETE: 'Branch.Delete', MANAGE: 'Branch.Manage' },
  ORGANIZATION: { READ: 'Organization.Read', UPDATE: 'Organization.Update' },
  ROLE: { READ: 'Role.Read', CREATE: 'Role.Create', UPDATE: 'Role.Update', DELETE: 'Role.Delete' },
  REPORTS: { READ: 'Reports.Read' },
  BILLING: { READ: 'Billing.Read', CREATE: 'Billing.Create', MANAGE: 'Billing.Manage' },
};

export const seedPermissions = async (prisma: PrismaClient) => {
  console.log('Seeding permissions...');
  
  // Extract all permission strings from the PERMISSIONS constants
  const defaultPermissions = Object.values(PERMISSIONS).flatMap((group) =>
    Object.values(group).map((permName) => ({
      name: permName,
      description: `Permission for ${permName}`,
    }))
  );

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
};
