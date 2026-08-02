/* eslint-disable @next/next/no-img-element */
'use client';

import { useEmployee, useActivateEmployee, useDeactivateEmployee, useBranches } from '../employee.hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HasPermission } from '@/shared/components/HasPermission';
import { 
  UserCog, 
  UserX, 
  Mail, 
  Phone, 
  CalendarDays, 
  MapPin, 
  Edit,
  Clock,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function EmployeeDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useEmployee(id);
  const { data: branchesData } = useBranches();
  const activateMutation = useActivateEmployee();
  const deactivateMutation = useDeactivateEmployee();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-10 text-destructive bg-destructive/10 rounded-lg">
        Error loading employee details.
      </div>
    );
  }

  const employee = data.data;

  const handleStatusToggle = () => {
    if (employee.isActive) {
      deactivateMutation.mutate(employee.id, {
        onSuccess: () => toast.success('Employee deactivated'),
      });
    } else {
      activateMutation.mutate(employee.id, {
        onSuccess: () => toast.success('Employee activated'),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* 70% Layout (Left) */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex items-center gap-6">
                <div 
                  className="h-24 w-24 rounded-full flex items-center justify-center text-4xl text-primary font-bold overflow-hidden bg-primary/10 border-4 border-background shadow-sm"
                  style={{ borderColor: employee.calendarColor || undefined }}
                >
                  {employee.profileImageId ? (
                    <img src={employee.profileImageId} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    `${employee.firstName[0]}${employee.lastName[0]}`
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'} className={employee.isActive ? 'bg-green-600' : ''}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4" /> {employee.role?.name || 'No Role Assigned'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <HasPermission permission="Employee.Manage">
                  <Button variant="outline" onClick={handleStatusToggle}>
                    {employee.isActive ? (
                      <><UserX className="mr-2 h-4 w-4 text-destructive" /> Deactivate</>
                    ) : (
                      <><UserCog className="mr-2 h-4 w-4 text-green-600" /> Activate</>
                    )}
                  </Button>
                </HasPermission>
                <HasPermission permission="Employee.Update">
                  <Button onClick={() => router.push(`/employees/${employee.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </HasPermission>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{employee.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{employee.phone || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Date of Joining</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.dateOfJoining ? format(new Date(employee.dateOfJoining), 'PPP') : 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Branches</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {employee.branches && employee.branches.length > 0 ? (
                      employee.branches.map(b => {
                        const branchName = branchesData?.data.find(bd => bd.id === b.branchId)?.name || b.branchId;
                        return (
                          <Badge key={b.branchId} variant="outline" className={b.isPrimary ? 'border-primary text-primary' : ''}>
                            {branchName} {b.isPrimary && '(Primary)'}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">No branches assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio & Emergency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bio & Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Bio</h4>
              <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
                {employee.bio || 'No bio provided for this employee.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Emergency Contact Name</h4>
                <p className="text-sm text-muted-foreground">{employee.emergencyContactName || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Emergency Contact Phone</h4>
                <p className="text-sm text-muted-foreground">{employee.emergencyContactPhone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30% Layout (Right) - Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-3 border-2 border-dashed rounded-lg">
              <Clock className="h-8 w-8 opacity-50" />
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs text-center px-4">Performance metrics and appointment statistics will be available in future updates.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-3 border-2 border-dashed rounded-lg">
              <CalendarDays className="h-8 w-8 opacity-50" />
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs text-center px-4">Schedule integration will be available in Phase 4.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
