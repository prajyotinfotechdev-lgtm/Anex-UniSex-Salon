'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SettingsApi, BrandingConfiguration } from '@/modules/settings/settings.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function BrandingPage() {
  const [config, setConfig] = useState<BrandingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const data = await SettingsApi.getBranding();
      setConfig(data);
      if (data.designTokens) {
        setPrimaryColor(data.designTokens.primaryColor || '#000000');
        setLogoUrl(data.designTokens.logoUrl || '');
      }
    } catch (error: any) {
      toast.error('Failed to load branding: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await SettingsApi.updateBranding({
        version: config.version,
        designTokens: {
          ...config.designTokens,
          primaryColor,
          logoUrl
        }
      });
      setConfig(updated);
      toast.success('Branding updated successfully');
    } catch (error: any) {
      toast.error('Failed to update branding: ' + error.message);
      fetchBranding(); // reload to get correct version on conflict
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Branding & Design</h2>
        <p className="text-muted-foreground mt-1">Customize the look and feel of your salon app.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>Configure colors and assets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input 
                type="text" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-sm text-muted-foreground">Used for buttons, active states, and highlights.</p>
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input 
              type="url" 
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">URL to your organization logo image.</p>
          </div>

        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
