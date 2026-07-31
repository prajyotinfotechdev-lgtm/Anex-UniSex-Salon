'use client';

import * as React from 'react';
import { usePermission } from '../providers/PermissionProvider';

interface HasPermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HasPermission({ permission, children, fallback = null }: HasPermissionProps) {
  const { hasPermission } = usePermission();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
