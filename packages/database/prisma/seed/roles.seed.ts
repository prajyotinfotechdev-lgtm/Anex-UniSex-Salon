import { PrismaClient, RoleType } from '@prisma/client';

export const seedRoles = async (prisma: PrismaClient, organizationId: string) => {
  console.log('Seeding roles...');

  let role = await prisma.role.findFirst({
    where: { organizationId, name: 'SYSTEM Admin' }
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        organizationId,
        name: 'SYSTEM Admin',
        type: RoleType.SYSTEM,
      },
    });
  }

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Link all permissions to the role
  for (const perm of allPermissions) {
    const existingLink = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: perm.id,
        },
      },
    });

    if (!existingLink) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }

  return role;
};
