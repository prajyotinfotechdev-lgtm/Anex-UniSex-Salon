'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Building2, Star } from 'lucide-react';
import Link from 'next/link';
import { BranchApi, Branch } from '@/modules/branch/branch.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await BranchApi.list();
      setBranches(data);
    } catch (error: any) {
      toast.error('Failed to load branches: ' + error.message);
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Branches</h2>
          <p className="text-muted-foreground mt-1">Manage multiple salon locations and their settings.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Branch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branches.map(branch => (
          <Card key={branch.id} className="relative hover:border-primary transition-colors">
            {branch.isDefault && (
              <Badge className="absolute top-4 right-4" variant="default">
                <Star className="h-3 w-3 mr-1" /> Default
              </Badge>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                {branch.name}
              </CardTitle>
              {branch.branchCode && (
                <CardDescription>Code: {branch.branchCode}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{branch.address || 'No address provided'}</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-semibold">{branch._count?.employees || 0}</span> Staff
                </div>
                <Link href={`/settings/branches/${branch.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Manage
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {branches.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No branches found</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add your first branch location to get started.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
