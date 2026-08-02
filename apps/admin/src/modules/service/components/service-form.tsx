'use client';
 
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { serviceFormSchema, ServiceFormValues, PricingType } from '../service.types';
import { useCreateService, useUpdateService } from '../service.hooks';
import { useServiceCategories } from '../service-category.hooks';
import { EmployeeAssignmentSelect } from './employee-assignment-select';
import { BranchPricingInputs } from './branch-pricing-inputs';

interface ServiceFormProps {
  initialData?: Partial<ServiceFormValues>;
  serviceId?: string;
  isEdit?: boolean;
}

const defaultValues: Partial<ServiceFormValues> = {
  name: '',
  description: '',
  serviceCategoryId: '',
  pricingType: PricingType.FIXED,
  basePrice: 0,
  durationMinutes: 30,
  processingMinutes: 0,
  cleanupMinutes: 0,
  beforeBufferMinutes: 0,
  afterBufferMinutes: 0,
  color: '',
  requiresConsultation: false,
  requiresPatchTest: false,
  isActive: true,
  employees: [],
  branches: [],
};

export function ServiceForm({ initialData, serviceId, isEdit }: ServiceFormProps) {
  const router = useRouter();
  const { data: categoriesData, isLoading: categoriesLoading } = useServiceCategories({ limit: 100, isActive: true });
  const categories = categoriesData?.data || [];

  const createMutation = useCreateService();
  const updateMutation = useUpdateService(serviceId as string);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as any,
    defaultValues: { ...defaultValues, ...initialData } as ServiceFormValues,
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast.success('Service updated successfully');
        router.push(`/services/${serviceId}`);
      } else {
        const result = await createMutation.mutateAsync(data);
        toast.success('Service created successfully');
        router.push(`/services/${result.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">General Information</h3>
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Men's Haircut" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Service description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="serviceCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="pricingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PricingType.FIXED}>Fixed</SelectItem>
                            <SelectItem value={PricingType.STARTING_AT}>Starting At</SelectItem>
                            <SelectItem value={PricingType.VARIABLE}>Variable</SelectItem>
                            <SelectItem value={PricingType.FREE}>Free</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Duration & Buffers (Minutes)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="processingMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Processing Time</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="beforeBufferMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Before Buffer</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="afterBufferMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>After Buffer</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="cleanupMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cleanup Time</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Requirements & Status</h3>
                
                <FormField
                  control={form.control as any}
                  name="requiresConsultation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Consultation Required</FormLabel>
                        <FormDescription>
                          Requires a consultation before booking.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="requiresPatchTest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Patch Test Required</FormLabel>
                        <FormDescription>
                          Requires a patch test before booking.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Whether the service is available for booking.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Employee Assignment</h3>
                <FormField
                  control={form.control as any}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Employees</FormLabel>
                      <FormControl>
                        <EmployeeAssignmentSelect
                          selectedIds={field.value}
                          onChange={field.onChange}
                          error={!!form.formState.errors.employees}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Branch Pricing</h3>
                <FormField
                  control={form.control as any}
                  name="branches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Branches & Overrides</FormLabel>
                      <FormControl>
                        <BranchPricingInputs
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (form.formState.isDirty) {
                if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                  router.back();
                }
              } else {
                router.back();
              }
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
