'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useServices, useActivateService, useDeactivateService } from '../service.hooks';
import { Service, ServiceListParams } from '../service.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Search, CheckCircle, XCircle, Copy, Edit, Eye } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/premium-loader';

export function ServiceList() {
  const router = useRouter();
  const [params, setParams] = React.useState<ServiceListParams>({ page: 1, limit: 10, search: '' });
  
  const { data, isLoading, isError } = useServices(params);
  const activateMutation = useActivateService();
  const deactivateMutation = useDeactivateService();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  const handleActivate = async (id: string) => {
    await activateMutation.mutateAsync(id);
  };

  const handleDeactivate = async (id: string) => {
    await deactivateMutation.mutateAsync(id);
  };

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name);
  };

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load services.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or description..." 
            className="pl-8" 
            value={params.search}
            onChange={handleSearch}
          />
        </div>
        <Link href="/services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 p-0">
                  <PremiumLoader text="Loading services..." />
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((service: Service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {service.color && (
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: service.color }} />
                      )}
                      <Link href={`/services/${service.id}`} className="hover:underline">
                        {service.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{service.serviceCategory?.name}</TableCell>
                  <TableCell>
                    {service.pricingType === 'FIXED' ? `₹${service.basePrice}` : `${service.pricingType.replace('_', ' ')} ₹${service.basePrice}`}
                  </TableCell>
                  <TableCell>{service.durationMinutes} min</TableCell>
                  <TableCell>{service.employeeServices?.length || 0}</TableCell>
                  <TableCell>{service.serviceBranches?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/services/${service.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/services/${service.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyName(service.name)}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Name
                        </DropdownMenuItem>
                        {service.isActive ? (
                          <DropdownMenuItem onClick={() => handleDeactivate(service.id)}>
                            <XCircle className="mr-2 h-4 w-4" /> Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleActivate(service.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Basic Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing page {data?.meta?.page || 1} of {data?.meta?.totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={params.page === 1}
            onClick={() => setParams({ ...params, page: (params.page || 1) - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={params.page === data?.meta?.totalPages || !data?.meta?.totalPages}
            onClick={() => setParams({ ...params, page: (params.page || 1) + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
