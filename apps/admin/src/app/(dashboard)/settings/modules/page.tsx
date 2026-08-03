'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SettingsApi, OrganizationModule } from '@/modules/settings/settings.api';
import { toast } from 'sonner';

export default function ModuleRegistryPage() {
  const [modules, setModules] = useState<OrganizationModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const data = await SettingsApi.listModules();
      setModules(data);
    } catch (error: any) {
      toast.error('Failed to load modules: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (mod: OrganizationModule, enabled: boolean) => {
    try {
      // Optimistic update
      setModules(prev => 
        prev.map(m => m.moduleId === mod.moduleId ? { ...m, enabled } : m)
      );

      const updated = await SettingsApi.updateModule(mod.moduleId, {
        enabled,
        version: mod.version,
      });

      // Update with server response (sync version)
      setModules(prev => 
        prev.map(m => m.moduleId === updated.moduleId ? updated : m)
      );
      toast.success(`${mod.module.name} module ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error('Failed to update module: ' + error.message);
      fetchModules(); // revert on failure
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Module Registry</h2>
        <p className="text-muted-foreground mt-1">Enable or disable features for your salon.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-xl" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {modules.map((orgModule) => (
            <Card key={orgModule.moduleId}>
              <div className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{orgModule.module.name}</h3>
                  <p className="text-sm text-muted-foreground">{orgModule.module.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground bg-accent px-2 py-1 rounded-md">
                    {orgModule.module.category}
                  </span>
                  <Switch
                    checked={orgModule.enabled}
                    onCheckedChange={(checked) => handleToggle(orgModule, checked)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
