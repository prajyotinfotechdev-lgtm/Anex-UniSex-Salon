'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  customerFormSchema,
  CustomerFormValues,
  Customer,
} from '../customer.types';
import { useCreateCustomer, useUpdateCustomer } from '../customer.hooks';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerFormProps {
  initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email || '',
      primaryPhone: initialData.primaryPhone,
      gender: initialData.gender || undefined,
      dob: initialData.dob || '',
      addressLine1: initialData.addressLine1 || '',
      addressLine2: initialData.addressLine2 || '',
      city: initialData.city || '',
      state: initialData.state || '',
      zipCode: initialData.zipCode || '',
      country: initialData.country || '',
      notes: initialData.notes || '',
      isActive: initialData.isActive,
      tags: initialData.tags?.map(t => t.id as string) || [],
    } : {
      firstName: '',
      lastName: '',
      email: '',
      primaryPhone: '',
      gender: undefined,
      dob: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: '',
      isActive: true,
      tags: [],
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            toast.success('Customer updated successfully');
            // Do not redirect on edit, just stay on the detail/edit page and let cache refresh
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || 'Failed to update customer');
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (newCustomer) => {
          toast.success('Customer created successfully');
          router.push(`/customers/${newCustomer.id}`);
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message || 'Failed to create customer');
        },
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input 
            id="firstName" 
            placeholder="John" 
            autoFocus
            disabled={isPending}
            {...form.register('firstName')}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input 
            id="lastName" 
            placeholder="Doe"
            disabled={isPending}
            {...form.register('lastName')}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
          )}
        </div>

        {/* Primary Phone */}
        <div className="space-y-2">
          <Label htmlFor="primaryPhone">Phone *</Label>
          <Input 
            id="primaryPhone" 
            placeholder="+1 555-0123"
            type="tel"
            disabled={isPending}
            {...form.register('primaryPhone')}
          />
          {form.formState.errors.primaryPhone && (
            <p className="text-sm text-destructive">{form.formState.errors.primaryPhone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            placeholder="john@example.com"
            type="email"
            disabled={isPending}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            placeholder="New York"
            disabled={isPending}
            {...form.register('city')}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input 
            id="notes" 
            placeholder="Preferences, allergies, etc."
            disabled={isPending}
            {...form.register('notes')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          disabled={isPending}
          onClick={() => {
            if (form.formState.isDirty) {
              if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.back();
              }
            } else {
              router.back();
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEditing ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}

export function CustomerFormSkeleton() {
  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
