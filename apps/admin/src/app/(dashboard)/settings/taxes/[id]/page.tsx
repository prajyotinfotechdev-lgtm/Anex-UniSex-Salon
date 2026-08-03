'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TaxApi, TaxCategory, TaxRate } from '@/modules/tax/tax.api';

export default function TaxGroupFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    isActive: boolean;
    isDefault: boolean;
    taxRates: TaxRate[];
  }>({
    name: '',
    description: '',
    isActive: true,
    isDefault: false,
    taxRates: [{ name: 'Tax', rate: 0, type: 'PERCENTAGE', priority: 0 }],
  });

  useEffect(() => {
    if (!isNew) {
      loadCategory();
    }
  }, [isNew]);

  const loadCategory = async () => {
    try {
      const data = await TaxApi.getCategory(params.id as string);
      setFormData({
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
        isDefault: data.isDefault,
        taxRates: data.taxRates.length > 0 ? data.taxRates : [{ name: 'Tax', rate: 0, type: 'PERCENTAGE', priority: 0 }],
      });
    } catch (error) {
      toast.error('Failed to load tax category');
      router.push('/settings/taxes');
    } finally {
      setLoading(false);
    }
  };

  const addTaxRate = () => {
    setFormData(prev => ({
      ...prev,
      taxRates: [
        ...prev.taxRates,
        { name: '', rate: 0, type: 'PERCENTAGE', priority: prev.taxRates.length }
      ]
    }));
  };

  const removeTaxRate = (index: number) => {
    if (formData.taxRates.length === 1) {
      toast.error('At least one tax rate is required');
      return;
    }
    setFormData(prev => {
      const newRates = [...prev.taxRates];
      newRates.splice(index, 1);
      return { ...prev, taxRates: newRates };
    });
  };

  const updateTaxRate = (index: number, field: keyof TaxRate, value: any) => {
    setFormData(prev => {
      const newRates = [...prev.taxRates];
      newRates[index] = { ...newRates[index], [field]: value };
      return { ...prev, taxRates: newRates };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        rates: formData.taxRates.map(r => ({
          name: r.name,
          rate: Number(r.rate),
          type: r.type,
          priority: Number(r.priority)
        }))
      };

      if (isNew) {
        await TaxApi.createCategory(payload);
        toast.success('Tax group created successfully');
      } else {
        await TaxApi.updateCategory(params.id as string, payload);
        toast.success('Tax group updated successfully');
      }
      router.push('/settings/taxes');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tax group');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalRate = () => {
    return formData.taxRates.reduce((sum, rate) => sum + Number(rate.rate || 0), 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/settings/taxes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Create Tax Group' : 'Edit Tax Group'}
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure tax rates and grouping for services and products.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Give this tax group a memorable name (e.g., Standard GST 18%).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., GST 18%"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Used for interstate sales"
                className="resize-none h-20"
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <div className="text-sm text-muted-foreground">
                  Inactive tax groups cannot be assigned to new services or products.
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Set as Default</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically select this tax group when creating new services/products.
                </div>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Tax Rates</CardTitle>
              <CardDescription>Add the individual tax components that make up this group.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium bg-muted px-3 py-1 rounded-md">
                Total: {calculateTotalRate()}%
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTaxRate}>
                <Plus className="h-4 w-4 mr-2" /> Add Rate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.taxRates.map((rate, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-md relative group">
                <div className="flex-1 grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Rate Name</Label>
                    <Input
                      required
                      placeholder="e.g., CGST"
                      value={rate.name}
                      onChange={(e) => updateTaxRate(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="9.00"
                      value={rate.rate}
                      onChange={(e) => updateTaxRate(index, 'rate', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Calculation Priority</Label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={rate.priority}
                      onChange={(e) => updateTaxRate(index, 'priority', e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeTaxRate(index)}
                  disabled={formData.taxRates.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="bg-muted/50 py-4 flex justify-between">
             <div className="text-sm text-muted-foreground flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Rates with the same priority are calculated on the base price.
             </div>
             <Button type="submit" disabled={saving}>
               {saving && <span className="animate-spin mr-2">⚪</span>}
               <Save className="mr-2 h-4 w-4" /> Save Tax Group
             </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
