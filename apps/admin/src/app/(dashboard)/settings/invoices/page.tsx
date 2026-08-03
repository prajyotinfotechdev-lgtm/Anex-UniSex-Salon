'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SettingsApi, InvoiceConfiguration } from '@/modules/settings/settings.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function InvoiceConfigPage() {
  const [config, setConfig] = useState<InvoiceConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [receiptPrefix, setReceiptPrefix] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [gstLayout, setGstLayout] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await SettingsApi.getInvoiceConfig();
      setConfig(data);
      setInvoicePrefix(data.invoicePrefix || '');
      setReceiptPrefix(data.receiptPrefix || '');
      setShowQrCode(data.showQrCode);
      setGstLayout(data.gstLayout);
    } catch (error: any) {
      toast.error('Failed to load invoice config: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await SettingsApi.updateInvoiceConfig({
        version: config.version,
        invoicePrefix,
        receiptPrefix,
        showQrCode,
        gstLayout
      });
      setConfig(updated);
      toast.success('Invoice configuration updated successfully');
    } catch (error: any) {
      toast.error('Failed to update config: ' + error.message);
      fetchConfig();
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
        <h2 className="text-2xl font-bold tracking-tight">Invoicing & Taxes</h2>
        <p className="text-muted-foreground mt-1">Configure how invoices are generated and formatted.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Format</CardTitle>
          <CardDescription>Prefixes and layouts for generated PDFs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input 
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV-"
              />
            </div>
            <div className="space-y-2">
              <Label>Receipt Prefix</Label>
              <Input 
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                placeholder="REC-"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show QR Code for Payment</Label>
                <p className="text-sm text-muted-foreground">Print a UPI/Payment QR code on invoices.</p>
              </div>
              <Switch checked={showQrCode} onCheckedChange={setShowQrCode} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>GST Layout</Label>
                <p className="text-sm text-muted-foreground">Use standard GST compliant invoice format.</p>
              </div>
              <Switch checked={gstLayout} onCheckedChange={setGstLayout} />
            </div>
          </div>

        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Config
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
