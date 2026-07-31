'use client';

import * as React from 'react';
import { useAuthStore } from '../store/authStore';

interface PermissionContextType {
  hasPermission: (permission: string) => boolean;
}

const PermissionContext = React.createContext<PermissionContextType>({
  hasPermission: () => false,
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return (
    <PermissionContext.Provider value={{ hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  return React.useContext(PermissionContext);
}
