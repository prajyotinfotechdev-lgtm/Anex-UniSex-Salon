'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Percent, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { TaxApi, TaxCategory } from '@/modules/tax/tax.api';
export default function TaxesPage() {
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await TaxApi.listCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load tax categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRate = (category: TaxCategory) => {
    return category.taxRates.reduce((sum, rate) => sum + Number(rate.rate), 0);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await TaxApi.updateCategory(id, { isActive: !currentStatus });
      setCategories(categories.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (error) {
      console.error('Failed to update tax status:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading taxes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Taxes</h2>
          <p className="text-muted-foreground mt-1">Manage tax groups and rates for services and products.</p>
        </div>
        <Link href="/settings/taxes/new" className={buttonVariants({ variant: 'default' })}>
          <Plus className="mr-2 h-4 w-4" /> Add Tax Group
        </Link>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Percent className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No tax groups found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Create your first tax group to start calculating taxes on invoices.
              </p>
            </div>
            <Link href="/settings/taxes/new" className={buttonVariants({ variant: 'outline' })}>
              <Plus className="mr-2 h-4 w-4" /> Create Tax Group
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {category.name}
                      {category.isDefault && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    {category.description && (
                      <CardDescription className="mt-1">{category.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground mr-1">Active</span>
                    <Switch 
                      checked={category.isActive} 
                      onCheckedChange={() => handleToggleActive(category.id, category.isActive)} 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">{calculateTotalRate(category)}%</div>
                    <div className="text-sm text-muted-foreground">Total Rate</div>
                  </div>
                  
                  {category.taxRates.length > 0 && (
                    <div className="bg-muted/50 rounded-md p-3 text-sm space-y-2">
                      {category.taxRates.map((rate, index) => (
                        <div key={index} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0 border-border/50">
                          <span className="font-medium">{rate.name}</span>
                          <span className="text-muted-foreground">{rate.rate}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t flex justify-between items-center">
                    <div className="text-sm text-muted-foreground flex gap-4">
                      <span><span className="font-semibold text-foreground">{category._count?.services || 0}</span> Services</span>
                      <span><span className="font-semibold text-foreground">{category._count?.products || 0}</span> Products</span>
                    </div>
                    <Link href={`/settings/taxes/${category.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Manage
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
