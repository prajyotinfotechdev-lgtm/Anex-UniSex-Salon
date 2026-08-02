'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useBranches, useRoles, useCreateEmployee, useUpdateEmployee } from '../employee.hooks';
import { Employee, employeeFormSchema, EmployeeFormValues } from '../employee.types';
import { MediaSelector } from '../../media/components/media-selector';

interface EmployeeFormProps {
  initialData?: Employee;
}

export function EmployeeForm({ initialData }: EmployeeFormProps) {
  const router = useRouter();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const { data: branchesData, isLoading: isLoadingBranches } = useBranches();
  
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const isEditing = !!initialData;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Format initial dateOfJoining if it exists
  const initialDate = initialData?.dateOfJoining ? new Date(initialData.dateOfJoining).toISOString().split('T')[0] : undefined;

  const defaultValues: Partial<EmployeeFormValues> = {
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    roleId: initialData?.roleId || '',
    bio: initialData?.bio || '',
    profileImageId: initialData?.profileImageId || '',
    dateOfJoining: initialDate || '',
    emergencyContactName: initialData?.emergencyContactName || '',
    emergencyContactPhone: initialData?.emergencyContactPhone || '',
    calendarColor: initialData?.calendarColor || '#3b82f6',
    isActive: initialData?.isActive ?? true,
    branches: initialData?.branches?.map(b => ({
      branchId: b.branchId,
      isPrimary: b.isPrimary
    })) || [],
  };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
  });

  // Avoid calling watch() directly in render for arrays when possible, but for form components we often need it.
  // Using useWatch might be preferred, but since this is a small form we can safely ignore the compiler warning or use useWatch.
   
  const branches = form.watch('branches') || [];

  const onSubmit = async (values: EmployeeFormValues) => {
    // Process values: empty strings should be undefined/null for optional fields if the backend requires
    const processedValues = { ...values };
    
    // Ensure primary branch logic
    if (processedValues.branches && processedValues.branches.length > 0) {
      const hasPrimary = processedValues.branches.some(b => b.isPrimary);
      if (!hasPrimary) {
        processedValues.branches[0].isPrimary = true;
      }
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData.id, data: processedValues }, {
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            form.setError('root', { message: err?.response?.data?.message || 'Failed to update employee' });
          }
        });
        router.push(`/employees/${initialData.id}`);
      } else {
        const response = await createMutation.mutateAsync(processedValues, {
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            form.setError('root', { message: err?.response?.data?.message || 'Failed to create employee' });
          }
        });
        router.push(`/employees/${response.data.id}`);
      }
    } catch {
      // Error handled by mutation callbacks
    }
  };

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    const currentBranches = form.getValues('branches') || [];
    
    if (checked) {
      // Add branch
      const isFirst = currentBranches.length === 0;
      form.setValue('branches', [...currentBranches, { branchId, isPrimary: isFirst }]);
    } else {
      // Remove branch
      const filtered = currentBranches.filter(b => b.branchId !== branchId);
      
      // If we removed the primary branch and others exist, make the first one primary
      const removedWasPrimary = currentBranches.find(b => b.branchId === branchId)?.isPrimary;
      if (removedWasPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      
      form.setValue('branches', filtered);
    }
  };

  const setPrimaryBranch = (branchId: string) => {
    const currentBranches = form.getValues('branches') || [];
    const updated = currentBranches.map(b => ({
      ...b,
      isPrimary: b.branchId === branchId
    }));
    form.setValue('branches', updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Basic details about the employee.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description about the employee..." 
                      className="resize-none" 
                      {...field} 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="profileImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {field.value && (
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                          {/* We don't easily have the URL here just the ID unless we fetch or get from selector onSelect, 
                              but for simplicity we just show it's selected. Normally we'd use the selectedAsset.url */}
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 bg-neutral-50">
                            Asset Selected
                          </div>
                        </div>
                      )}
                      <MediaSelector 
                        module="employees"
                        selectedAssetId={field.value}
                        onSelect={(asset) => field.onChange(asset.id)}
                      />
                      {field.value && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => field.onChange('')}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Select an image from the Media Studio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Employment Details</h3>
              <p className="text-sm text-muted-foreground">Role, branches, and organization info.</p>
            </div>

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                  <Select 
                    disabled={isLoadingRoles || isSubmitting} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesData?.data.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfJoining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Joining</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-md p-4 bg-muted/20">
              <h4 className="text-sm font-medium mb-3">Branch Assignment <span className="text-destructive">*</span></h4>
              
              {isLoadingBranches ? (
                <p className="text-sm text-muted-foreground">Loading branches...</p>
              ) : branchesData?.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No branches found.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                    {branchesData?.data.map((branch) => {
                      const isAssigned = branches.some(b => b.branchId === branch.id);
                      return (
                        <div key={branch.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`branch-${branch.id}`} 
                            checked={isAssigned}
                            onCheckedChange={(checked) => handleBranchToggle(branch.id, checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`branch-${branch.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {branch.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  
                  {form.formState.errors.branches && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.branches.message}
                    </p>
                  )}
                  
                  {branches.length > 0 && (
                    <div className="pt-3 border-t mt-3">
                      <p className="text-sm font-medium mb-2">Primary Branch</p>
                      <RadioGroup 
                        value={branches.find(b => b.isPrimary)?.branchId || ''} 
                        onValueChange={setPrimaryBranch}
                        disabled={isSubmitting}
                      >
                        {branches.map((b) => {
                          const branchDetails = branchesData?.data.find(bd => bd.id === b.branchId);
                          return (
                            <div key={b.branchId} className="flex items-center space-x-2">
                              <RadioGroupItem value={b.branchId} id={`primary-${b.branchId}`} />
                              <label htmlFor={`primary-${b.branchId}`} className="text-sm">
                                {branchDetails?.name || 'Unknown Branch'}
                              </label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  )}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="calendarColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calendar Color</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <span className="text-sm text-muted-foreground uppercase">{field.value}</span>
                  </div>
                  <FormDescription>
                    Color used for this employee&apos;s appointments on the calendar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
