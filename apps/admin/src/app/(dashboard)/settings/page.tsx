'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, ArrowRight, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import { SettingsApi, AuditLog } from '@/modules/settings/settings.api';

import { buttonVariants } from '@/components/ui/button';

export default function SettingsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    SettingsApi.getAuditLogs().then(setLogs).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Health Check</CardTitle>
          <CardDescription>Status of your organization's essential settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-semibold">Modules Configured</h4>
                <p className="text-sm text-muted-foreground">3 Core modules are active</p>
              </div>
            </div>
            <Link href="/settings/modules" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Manage <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div>
                <h4 className="font-semibold">Branding Incomplete</h4>
                <p className="text-sm text-muted-foreground">Default theme is active. Upload a logo.</p>
              </div>
            </div>
            <Link href="/settings/branding" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Customize <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-semibold">Invoicing & Taxes</h4>
                <p className="text-sm text-muted-foreground">Invoice prefixes and Tax groups are set.</p>
              </div>
            </div>
            <Link href="/settings/invoices" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Review <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Activity Timeline</CardTitle>
          </div>
          <CardDescription>Recent configuration and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="mt-1 p-2 bg-muted rounded-full">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {log.action} <span className="text-primary">{log.entityName}</span> {log.entityId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
