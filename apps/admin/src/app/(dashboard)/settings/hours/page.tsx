'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SettingsApi } from '@/modules/settings/settings.api';
import { employeesApi } from '@/shared/api/employees.api';
import { toast } from 'sonner';
import { Loader2, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
}

interface Availability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
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
  const [activeTab, setActiveTab] = useState<'employees' | 'closures'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // Availability states
  const [availability, setAvailability] = useState<Record<string, { startTime: string; endTime: string; isActive: boolean }>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [savingAvail, setSavingAvail] = useState(false);

  // Closures states
  const [closures, setClosures] = useState<Closure[]>([]);
  const [loadingClosures, setLoadingClosures] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState('');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [creatingClosure, setCreatingClosure] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchClosures();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await employeesApi.list({ limit: 100 });
      const activeEmployees = res.data.filter(e => e.isActive);
      setEmployees(activeEmployees);
      if (activeEmployees.length > 0) {
        setSelectedEmployeeId(activeEmployees[0].id);
        fetchEmployeeAvailability(activeEmployees[0].id);
      }
    } catch (e: any) {
      toast.error('Failed to load employees: ' + e.message);
    }
  };

  const fetchEmployeeAvailability = async (empId: string) => {
    setLoadingAvail(true);
    try {
      const data = await SettingsApi.getEmployeeAvailability(empId);
      
      // Initialize availability dictionary
      const initial: Record<string, { startTime: string; endTime: string; isActive: boolean }> = {};
      
      // Populate defaults for all days
      DAYS_OF_WEEK.forEach(day => {
        initial[day] = { startTime: '09:00', endTime: '21:00', isActive: false };
      });

      // Override with DB values
      data.forEach((item: any) => {
        if (initial[item.dayOfWeek]) {
          initial[item.dayOfWeek] = {
            startTime: item.startTime,
            endTime: item.endTime,
            isActive: true
          };
        }
      });

      setAvailability(initial);
    } catch (e: any) {
      toast.error('Failed to load availability: ' + e.message);
    } finally {
      setLoadingAvail(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedEmployeeId) return;
    setSavingAvail(true);
    try {
      // Map active ones to format
      const formatted = DAYS_OF_WEEK.filter(day => availability[day].isActive).map(day => ({
        dayOfWeek: day,
        startTime: availability[day].startTime,
        endTime: availability[day].endTime
      }));

      await SettingsApi.updateEmployeeAvailability(selectedEmployeeId, formatted);
      toast.success('Stylist availability updated successfully');
    } catch (e: any) {
      toast.error('Failed to update availability: ' + e.message);
    } finally {
      setSavingAvail(false);
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
      toast.success('Salon closure added successfully');
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
      toast.error('Failed to remove closure exception: ' + e.message);
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
            Configure salon operating hours, stylist schedules, and calendar holidays.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50">
          <Button
            variant={activeTab === 'employees' ? 'default' : 'ghost'}
            className="rounded-lg text-sm px-4 py-2"
            onClick={() => setActiveTab('employees')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Stylist Hours
          </Button>
          <Button
            variant={activeTab === 'closures' ? 'default' : 'ghost'}
            className="rounded-lg text-sm px-4 py-2"
            onClick={() => setActiveTab('closures')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Salon Closures
          </Button>
        </div>
      </div>

      {activeTab === 'employees' ? (
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Manage Stylist Shifts</CardTitle>
            <CardDescription>
              Assign the active working days and time slots for each stylist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Select Employee */}
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="employee-select">Select Stylist</Label>
              <select
                id="employee-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  fetchEmployeeAvailability(e.target.value);
                }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} {emp.title ? `(${emp.title})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {loadingAvail ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {DAYS_OF_WEEK.map(day => {
                    const dayAvail = availability[day] || { startTime: '09:00', endTime: '21:00', isActive: false };
                    return (
                      <div
                        key={day}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/10 transition-all gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={dayAvail.isActive}
                            onCheckedChange={(checked) => {
                              setAvailability(prev => ({
                                ...prev,
                                [day]: { ...prev[day], isActive: checked }
                              }));
                            }}
                          />
                          <span className="font-semibold text-sm capitalize">{day.toLowerCase()}</span>
                        </div>

                        {dayAvail.isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground block">Starts</span>
                              <Input
                                type="time"
                                className="w-32 h-9"
                                value={dayAvail.startTime}
                                onChange={(e) => {
                                  setAvailability(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day], startTime: e.target.value }
                                  }));
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground px-1 self-end mb-2">to</span>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground block">Ends</span>
                              <Input
                                type="time"
                                className="w-32 h-9"
                                value={dayAvail.endTime}
                                onChange={(e) => {
                                  setAvailability(prev => ({
                                    ...prev,
                                    [day]: { ...prev[day], endTime: e.target.value }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic self-center">Not Working / Salon Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveAvailability} disabled={savingAvail || !selectedEmployeeId}>
                    {savingAvail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Schedule
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
                Mark specific dates when the salon is fully closed.
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
