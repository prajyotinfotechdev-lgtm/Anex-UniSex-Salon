'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BranchApi, BranchDetails, WorkingHour } from '@/modules/branch/branch.api';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export default function BranchDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [branch, setBranch] = useState<BranchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState<WorkingHour[]>([]);

  useEffect(() => {
    fetchBranch();
  }, [id]);

  const fetchBranch = async () => {
    try {
      const data = await BranchApi.get(id);
      setBranch(data);
      setName(data.name);
      setAddress(data.address || '');
      
      // Initialize hours to ensure all days exist
      const existingHours = data.workingHours || [];
      const completeHours = DAYS_OF_WEEK.map(day => {
        const found = existingHours.find((h: any) => h.dayOfWeek === day);
        if (found) {
          // Time format cleanup from ISO DB Date string
          let open = found.openTime ? new Date(found.openTime).toISOString().substring(11, 16) : '';
          let close = found.closeTime ? new Date(found.closeTime).toISOString().substring(11, 16) : '';
          return { ...found, openTime: open, closeTime: close };
        }
        return { dayOfWeek: day, isOpen: true, openTime: '09:00', closeTime: '18:00' };
      });
      setHours(completeHours);
    } catch (error: any) {
      toast.error('Failed to load branch');
      router.push('/settings/branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!branch) return;
    setSaving(true);
    try {
      const updated = await BranchApi.update(id, { name, address, version: branch.version });
      setBranch(prev => prev ? { ...prev, ...updated } : null);
      toast.success('Branch details updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHours = async () => {
    setSaving(true);
    try {
      // Ensure null is sent for closed days or empty inputs
      const payload = hours.map(h => ({
        ...h,
        openTime: h.isOpen && h.openTime ? h.openTime : null,
        closeTime: h.isOpen && h.closeTime ? h.closeTime : null,
      }));
      await BranchApi.upsertWorkingHours(id, payload);
      toast.success('Working hours updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHourChange = (day: string, field: string, value: any) => {
    setHours(prev => prev.map(h => h.dayOfWeek === day ? { ...h, [field]: value } : h));
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!branch) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings/branches" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{branch.name}</h2>
          <p className="text-muted-foreground mt-1">Manage settings specific to this location</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Branch Profile</CardTitle>
              <CardDescription>Basic information for this location.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={handleSaveGeneral} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Standard Working Hours</CardTitle>
              <CardDescription>Set the regular opening and closing times for this branch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {hours.map(hour => (
                <div key={hour.dayOfWeek} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4 w-48">
                    <Switch 
                      checked={hour.isOpen} 
                      onCheckedChange={(checked) => handleHourChange(hour.dayOfWeek, 'isOpen', checked)} 
                    />
                    <Label className="font-semibold">{hour.dayOfWeek.charAt(0) + hour.dayOfWeek.slice(1).toLowerCase()}</Label>
                  </div>
                  
                  {hour.isOpen ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        value={hour.openTime || ''} 
                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'openTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input 
                        type="time" 
                        value={hour.closeTime || ''} 
                        onChange={(e) => handleHourChange(hour.dayOfWeek, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-end w-[280px]">
                      <span className="text-sm text-muted-foreground italic">Closed</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={handleSaveHours} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Working Hours
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <CardTitle>Holidays & Closures</CardTitle>
              <CardDescription>Manage special days where this branch is closed or has different hours.</CardDescription>
            </CardHeader>
            <CardContent>
              {branch.holidays?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                  No upcoming holidays scheduled.
                </p>
              ) : (
                <div className="space-y-4">
                  {branch.holidays?.map(holiday => (
                    <div key={holiday.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{holiday.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(holiday.date).toLocaleDateString()} 
                          {!holiday.fullDay && holiday.startTime && ` • ${holiday.startTime} - ${holiday.endTime}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
