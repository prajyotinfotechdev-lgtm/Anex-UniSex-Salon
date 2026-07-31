import { prisma } from '../database/prisma.client';
import { PermissionType } from '@anex/shared';

export const hasPermission = async (
  userId: string,
  roleId: string,
  permissionName: PermissionType
): Promise<boolean> => {
  // First check direct user permissions
  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId,
      permission: {
        name: permissionName,
      },
    },
  });

  if (userPermission) {
    return true;
  }

  // Then check role permissions
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      roleId,
      permission: {
        name: permissionName,
      },
    },
  });

  return !!rolePermission;
};
