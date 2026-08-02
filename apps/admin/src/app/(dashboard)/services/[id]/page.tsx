'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useService, useActivateService, useDeactivateService } from '@/modules/service/service.hooks';
import { Loader2, Edit, CheckCircle, XCircle, Copy, Clock, DollarSign, Users, Building, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: service, isLoading, isError } = useService(id);
  const activateMutation = useActivateService();
  const deactivateMutation = useDeactivateService();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Failed to load service.
      </div>
    );
  }

  const handleCopyName = () => {
    navigator.clipboard.writeText(service.name);
  };

  const totalTime = service.durationMinutes + (service.processingMinutes || 0) + (service.cleanupMinutes || 0) + service.beforeBufferMinutes + service.afterBufferMinutes;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {service.color && (
              <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: service.color }} />
            )}
            <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
            <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-600" : ""}>
              {service.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {service.serviceCategory?.name}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {service.pricingType === 'FIXED' ? `$${service.basePrice}` : `${service.pricingType.replace('_', ' ')} $${service.basePrice}`}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {service.durationMinutes} min
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyName}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Name
          </Button>
          <Button variant="outline" onClick={() => router.push(`/services/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {service.isActive ? (
            <Button variant="secondary" onClick={() => deactivateMutation.mutateAsync(id)}>
              <XCircle className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          ) : (
            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => activateMutation.mutateAsync(id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 70% Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {service.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Pricing Type</span>
                  <p className="text-sm text-muted-foreground">{service.pricingType.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Base Price</span>
                  <p className="text-sm text-muted-foreground">${service.basePrice}</p>
                </div>
              </div>
              <hr className="my-4 border-border" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Before Buffer</span>
                  <p className="text-sm text-muted-foreground">{service.beforeBufferMinutes} min</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Duration</span>
                  <p className="text-sm text-muted-foreground">{service.durationMinutes} min</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Processing</span>
                  <p className="text-sm text-muted-foreground">{service.processingMinutes || 0} min</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Cleanup</span>
                  <p className="text-sm text-muted-foreground">{service.cleanupMinutes || 0} min</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">After Buffer</span>
                  <p className="text-sm text-muted-foreground">{service.afterBufferMinutes} min</p>
                </div>
              </div>
              <hr className="my-4 border-border" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Consultation Required</span>
                  <p className="text-sm text-muted-foreground">{service.requiresConsultation ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Patch Test Required</span>
                  <p className="text-sm text-muted-foreground">{service.requiresPatchTest ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Assigned Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {service.employeeServices && service.employeeServices.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {service.employeeServices.map((es: any) => (
                      <div key={es.employeeId} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>{es.employee?.firstName?.[0]}{es.employee?.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{es.employee?.firstName} {es.employee?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{es.employee?.role?.name || 'Staff'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-4">No employees assigned.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Branch Pricing</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {service.serviceBranches && service.serviceBranches.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {service.serviceBranches.map((sb: any) => (
                      <div key={sb.branchId} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{sb.branch?.name || 'Branch'}</span>
                        <span className="text-sm text-muted-foreground">${sb.price || sb.priceOverride || service.basePrice}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-4">Available at all branches at base price.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 30% Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Time Blocked</span>
                <span className="text-sm font-medium">{totalTime} min</span>
              </div>
              <hr className="my-4 border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created At</span>
                <span className="text-sm font-medium">{new Date(service.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">{new Date(service.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed rounded-lg bg-muted/50">
                <span className="text-2xl font-bold text-muted-foreground">--</span>
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed rounded-lg bg-muted/50">
                <span className="text-2xl font-bold text-muted-foreground">--</span>
                <span className="text-sm text-muted-foreground">Revenue Generated</span>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
