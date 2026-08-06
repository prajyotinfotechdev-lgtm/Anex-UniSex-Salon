'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '../customer.types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HasPermission } from '@/shared/components/HasPermission';
import { 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  UserPen, 
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useActivateCustomer, useDeactivateCustomer, useHardDeleteCustomer } from '../customer.hooks';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export function CustomerDetailHeader({ customer }: { customer: Customer }) {
  const router = useRouter();
  const activateMutation = useActivateCustomer();
  const deactivateMutation = useDeactivateCustomer();
  const hardDeleteMutation = useHardDeleteCustomer();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${type} to clipboard`);
  };

  const handleStatusToggle = () => {
    if (customer.isActive) {
      deactivateMutation.mutate(customer.id, {
        onSuccess: () => toast.success('Customer deactivated'),
        onError: () => toast.error('Failed to deactivate customer'),
      });
    } else {
      activateMutation.mutate(customer.id, {
        onSuccess: () => toast.success('Customer activated'),
        onError: () => toast.error('Failed to activate customer'),
      });
    }
  };

  const handleDelete = () => {
    hardDeleteMutation.mutate(customer.id, {
      onSuccess: () => {
        toast.success('Customer permanently deleted');
        router.push('/customers');
      },
      onError: () => toast.error('Failed to delete customer'),
    });
  };

  const initials = `${customer.firstName[0]}${customer.lastName[0]}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/customers" className="hover:text-primary transition-colors">Customers</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{customer.firstName} {customer.lastName}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {customer.firstName} {customer.lastName}
              </h2>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                customer.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {customer.isActive ? (
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                )}
                {customer.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 group cursor-pointer" onClick={() => handleCopy(customer.primaryPhone, 'Phone')}>
                <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                <span className="group-hover:text-foreground transition-colors">{customer.primaryPhone}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {customer.email && (
                <div className="flex items-center gap-1 group cursor-pointer" onClick={() => handleCopy(customer.email as string, 'Email')}>
                  <Mail className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                  <span className="group-hover:text-foreground transition-colors">{customer.email}</span>
                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant={customer.isActive ? "outline" : "default"} 
            className={customer.isActive ? "text-destructive hover:text-destructive" : "bg-green-600 hover:bg-green-700 text-white"}
            onClick={handleStatusToggle}
          >
            {customer.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          <HasPermission permission="Customer.Update">
            <Button onClick={() => router.push(`/customers/${customer.id}/edit`)}>
              <UserPen className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </HasPermission>

          <HasPermission permission="Customer.Delete">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="ml-2">Delete Permanently</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the customer profile, their devices, forms, and all associated personal records. Appointments and invoices will remain for financial integrity but will be unlinked from this profile.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={handleDelete}>
                      Yes, delete permanently
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </HasPermission>
        </div>
      </div>
    </div>
  );
}

export function CustomerDetailHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-24" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
