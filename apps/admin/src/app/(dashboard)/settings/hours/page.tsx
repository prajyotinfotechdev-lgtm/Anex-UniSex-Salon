'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SettingsApi } from '@/modules/settings/settings.api';
import { toast } from 'sonner';
import { Loader2, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';

interface BranchWorkingHour {
  dayOfWeek: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface Closure {
  id: string;
  date: string;
  isClosed: boolean;
  reason?: string;
  startTime?: string | null;
  endTime?: string | null;
}

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

export default function WorkingHoursPage() {
  const [activeTab, setActiveTab] = useState<'salon' | 'closures'>('salon');
  
  // Salon Hours states
  const [salonHours, setSalonHours] = useState<Record<string, { openTime: string; closeTime: string; isOpen: boolean }>>({});
  const [loadingHours, setLoadingHours] = useState(true);
  const [savingHours, setSavingHours] = useState(false);

  // Closures states
  const [closures, setClosures] = useState<Closure[]>([]);
  const [loadingClosures, setLoadingClosures] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [creatingClosure, setCreatingClosure] = useState(false);

  useEffect(() => {
    fetchSalonHours();
    fetchClosures();
  }, []);

  const fetchSalonHours = async () => {
    setLoadingHours(true);
    try {
      const data = await SettingsApi.getBranchWorkingHours();
      
      const initial: Record<string, { openTime: string; closeTime: string; isOpen: boolean }> = {};
      
      // Populate defaults for all days (Mon-Sun 9 AM - 9 PM)
      DAYS_OF_WEEK.forEach(day => {
        initial[day] = { openTime: '09:00', closeTime: '21:00', isOpen: true };
      });

      // Helper to format Date or string to HH:MM
      const formatTime = (timeVal: any): string => {
        if (!timeVal) return '09:00';
        if (typeof timeVal === 'string') {
          return timeVal.substring(0, 5);
        }
        const d = new Date(timeVal);
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const minutes = String(d.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      // Override with configured working hours
      data.forEach((item: any) => {
        if (initial[item.dayOfWeek]) {
          initial[item.dayOfWeek] = {
            openTime: formatTime(item.openTime),
            closeTime: formatTime(item.closeTime),
            isOpen: item.isOpen
          };
        }
      });

      setSalonHours(initial);
    } catch (e: any) {
      toast.error('Failed to load salon working hours: ' + e.message);
    } finally {
      setLoadingHours(false);
    }
  };

  const handleSaveSalonHours = async () => {
    setSavingHours(true);
    try {
      const formatted = DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day,
        isOpen: salonHours[day].isOpen,
        openTime: salonHours[day].isOpen ? salonHours[day].openTime : null,
        closeTime: salonHours[day].isOpen ? salonHours[day].closeTime : null
      }));

      await SettingsApi.updateBranchWorkingHours(formatted);
      toast.success('Salon working hours updated successfully');
      fetchSalonHours();
    } catch (e: any) {
      toast.error('Failed to update salon hours: ' + e.message);
    } finally {
      setSavingHours(false);
    }
  };

  const fetchClosures = async () => {
    setLoadingClosures(true);
    try {
      const data = await SettingsApi.listClosures();
      setClosures(data);
    } catch (e: any) {
      toast.error('Failed to load salon closures: ' + e.message);
    } finally {
      setLoadingClosures(false);
    }
  };

  const handleAddClosure = async () => {
    if (!newClosureDate) {
      toast.error('Please select a closure date');
      return;
    }
    setCreatingClosure(true);
    try {
      await SettingsApi.createClosure({
        date: newClosureDate,
        reason: newClosureReason,
        isClosed: true
      });
      toast.success('Salon closure exception added');
      setNewClosureDate('');
      setNewClosureReason('');
      fetchClosures();
    } catch (e: any) {
      toast.error('Failed to add closure: ' + e.message);
    } finally {
      setCreatingClosure(false);
    }
  };

  const handleDeleteClosure = async (id: string) => {
    try {
      await SettingsApi.deleteClosure(id);
      toast.success('Salon closure exception removed');
      fetchClosures();
    } catch (e: any) {
      toast.error('Failed to remove closure: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Working Hours & Closures
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage the universal operating hours and calendar closures for the salon.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50">
          <Button
            variant={activeTab === 'salon' ? 'default' : 'ghost'}
            className="rounded-lg text-sm px-4 py-2"
            onClick={() => setActiveTab('salon')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Universal Operating Hours
          </Button>
          <Button
            variant={activeTab === 'closures' ? 'default' : 'ghost'}
            className="rounded-lg text-sm px-4 py-2"
            onClick={() => setActiveTab('closures')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Salon Closures / Holidays
          </Button>
        </div>
      </div>

      {activeTab === 'salon' ? (
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Universal Operating Hours</CardTitle>
            <CardDescription>
              Configure the default opening and closing times of the salon for each day of the week.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingHours ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {DAYS_OF_WEEK.map(day => {
                    const dayHours = salonHours[day] || { openTime: '09:00', closeTime: '21:00', isOpen: true };
                    return (
                      <div
                        key={day}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/10 transition-all gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={dayHours.isOpen}
                            onCheckedChange={(checked) => {
                              setSalonHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], isOpen: checked }
                              }));
                            }}
                          />
                          <span className="font-semibold text-sm capitalize">{day.toLowerCase()}</span>
                        </div>

                        {dayHours.isOpen ? (
                          <div className="flex items-center gap-2">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground block">Open Time</span>
                              <Input
                                type="time"
                                className="w-32 h-9"
                                value={dayHours.openTime}
                                onChange={(e) => {
                                  setSalonHours(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day], openTime: e.target.value }
                                  }));
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground px-1 self-end mb-2">to</span>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground block">Close Time</span>
                              <Input
                                type="time"
                                className="w-32 h-9"
                                value={dayHours.closeTime}
                                onChange={(e) => {
                                  setSalonHours(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day], closeTime: e.target.value }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic self-center">Salon Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveSalonHours} disabled={savingHours}>
                    {savingHours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Operating Hours
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Closure */}
          <Card className="lg:col-span-1 border-border/50 shadow-md h-fit">
            <CardHeader>
              <CardTitle>Add Closed Date</CardTitle>
              <CardDescription>
                Mark specific calendar dates when the salon is fully closed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="closure-date">Date</Label>
                <Input
                  id="closure-date"
                  type="date"
                  value={newClosureDate}
                  onChange={(e) => setNewClosureDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closure-reason">Reason</Label>
                <Input
                  id="closure-reason"
                  type="text"
                  placeholder="e.g. Independence Day Holiday"
                  value={newClosureReason}
                  onChange={(e) => setNewClosureReason(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleAddClosure} disabled={creatingClosure}>
                {creatingClosure && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Salon Closure
              </Button>
            </CardContent>
          </Card>

          {/* List Closures */}
          <Card className="lg:col-span-2 border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Active Closures & Holidays</CardTitle>
              <CardDescription>
                Listed days when the booking system is fully disabled for the salon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClosures ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : closures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm italic">
                  No upcoming closures registered. The salon is open according to regular shifts.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {closures.map(closure => {
                    const dateObj = new Date(closure.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    return (
                      <div key={closure.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                        <div>
                          <p className="font-semibold text-sm">{formattedDate}</p>
                          {closure.reason && (
                            <p className="text-xs text-muted-foreground mt-0.5">{closure.reason}</p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                          onClick={() => handleDeleteClosure(closure.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
