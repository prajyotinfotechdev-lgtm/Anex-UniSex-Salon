import { PrismaClient } from '@prisma/client';

export const seedPermissions = async (prisma: PrismaClient) => {
  console.log('Seeding permissions...');
  
  const defaultPermissions = [
    { name: 'appointments.read', description: 'Read appointments' },
    { name: 'appointments.write', description: 'Manage appointments' },
    { name: 'customers.read', description: 'Read customers' },
    { name: 'customers.write', description: 'Manage customers' },
    { name: 'employees.read', description: 'Read employees' },
    { name: 'employees.write', description: 'Manage employees' },
    { name: 'services.read', description: 'Read services' },
    { name: 'services.write', description: 'Manage services' },
    { name: 'billing.read', description: 'Read billing & invoices' },
    { name: 'billing.write', description: 'Manage billing & invoices' },
    { name: 'reports.read', description: 'Read reports and analytics' },
    { name: 'settings.read', description: 'Read system settings' },
    { name: 'settings.write', description: 'Manage system settings' },
  ];

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
};
