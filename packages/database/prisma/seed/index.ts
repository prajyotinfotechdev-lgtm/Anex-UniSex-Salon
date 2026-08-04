import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedOrganizationSettings } from './organization-settings.seed';
import { seedTaxCategories } from './tax-categories.seed';
import { seedNotificationTemplates } from './notification-templates.seed';
import { seedServiceCategories } from './service-categories.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('======================================');
  console.log('Starting ANEX OS Seed...');
  console.log('======================================');

  try {
    // 1. Seed Permissions
    await seedPermissions(prisma);

    // 2. Organization
    let organization = await prisma.organization.findFirst();
    if (!organization) {
      console.log('Creating Organization...');
      organization = await prisma.organization.create({
        data: {
          name: 'ANEX Salon HQ',
        },
      });
    }

    // 3. Branch
    let branch = await prisma.branch.findFirst({
      where: { organizationId: organization.id },
    });
    if (!branch) {
      console.log('Creating Branch...');
      branch = await prisma.branch.create({
        data: {
          organizationId: organization.id,
          name: 'Main Branch',
          phone: '1234567890',
          address: '123 Main St',
        },
      });
    }

    // 4. Roles (Calls seedRoles and gets SYSTEM Admin role)
    const systemAdminRole = await seedRoles(prisma, organization.id);

    // 5. Settings & Config
    await seedOrganizationSettings(prisma, organization.id);
    await seedTaxCategories(prisma, organization.id);
    await seedNotificationTemplates(prisma, organization.id);
    await seedServiceCategories(prisma, organization.id);

    // 6. Admin User & Employee
    const adminEmail = 'admin@anex.local';
    const adminPassword = 'Admin@12345';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { employee: true },
    });

    if (!adminUser) {
      console.log('Creating Admin User...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          employee: {
            create: {
              organizationId: organization.id,
              roleId: systemAdminRole.id,
              firstName: 'System',
              lastName: 'Admin',
              employeeBranches: {
                create: {
                  branchId: branch.id,
                  isPrimary: true,
                },
              },
            },
          },
        },
        include: { employee: true },
      });
    }

    console.log('======================================');
    console.log('ANEX OS Seed Complete');
    console.log('Organization:', organization.name);
    console.log('Branch:', branch.name);
    console.log('Admin Email:', adminEmail);
    console.log('Admin Password:', adminPassword);
    console.log('======================================');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
