import { PrismaClient, RoleType } from '@prisma/client';

export const seedRoles = async (prisma: PrismaClient, organizationId: string) => {
  console.log('Seeding roles...');

  // 1. SYSTEM Admin
  let systemAdmin = await prisma.role.findFirst({
    where: { organizationId, name: 'SYSTEM Admin' }
  });

  if (!systemAdmin) {
    systemAdmin = await prisma.role.create({
      data: {
        organizationId,
        name: 'SYSTEM Admin',
        type: RoleType.SYSTEM,
      },
    });
  }

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Link all permissions to SYSTEM Admin
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: systemAdmin.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: systemAdmin.id,
        permissionId: perm.id,
      },
    });
  }

  // 2. Manager Role
  let manager = await prisma.role.findFirst({
    where: { organizationId, name: 'Manager' }
  });
  if (!manager) {
    manager = await prisma.role.create({
      data: {
        organizationId,
        name: 'Manager',
        type: RoleType.CUSTOM,
      },
    });
  }
  // Link all permissions except Role manage/create/delete to Manager
  const managerPermissionsList = ['Customer.', 'Employee.', 'Appointment.', 'Service.', 'Branch.', 'Organization.Read', 'Reports.', 'Billing.'];
  for (const perm of allPermissions) {
    if (managerPermissionsList.some(p => perm.name.startsWith(p)) && !perm.name.startsWith('Role.C') && !perm.name.startsWith('Role.D') && !perm.name.startsWith('Role.U')) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: manager.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: manager.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 3. Receptionist Role
  let receptionist = await prisma.role.findFirst({
    where: { organizationId, name: 'Receptionist' }
  });
  if (!receptionist) {
    receptionist = await prisma.role.create({
      data: {
        organizationId,
        name: 'Receptionist',
        type: RoleType.CUSTOM,
      },
    });
  }
  // Link appropriate permissions to Receptionist
  const receptionistPermissionsList = [
    'Customer.Read', 'Customer.Create', 'Customer.Update',
    'Employee.Read',
    'Appointment.Read', 'Appointment.Create', 'Appointment.Update',
    'Service.Read',
    'Billing.Read', 'Billing.Create'
  ];
  for (const perm of allPermissions) {
    if (receptionistPermissionsList.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: receptionist.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: receptionist.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 4. Stylist Role
  let stylist = await prisma.role.findFirst({
    where: { organizationId, name: 'Stylist' }
  });
  if (!stylist) {
    stylist = await prisma.role.create({
      data: {
        organizationId,
        name: 'Stylist',
        type: RoleType.CUSTOM,
      },
    });
  }
  // Link appropriate permissions to Stylist
  const stylistPermissionsList = [
    'Customer.Read', 'Customer.Create', 'Customer.Update',
    'Employee.Read',
    'Appointment.Read', 'Appointment.Create', 'Appointment.Update',
    'Service.Read',
    'Billing.Read'
  ];
  for (const perm of allPermissions) {
    if (stylistPermissionsList.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: stylist.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: stylist.id,
          permissionId: perm.id,
        },
      });
    }
  }

  return systemAdmin;
};
