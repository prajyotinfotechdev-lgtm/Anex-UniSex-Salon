import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/axios';
import { toast } from 'sonner';
import {
  Appointment,
  AppointmentFormValues,
  PaginatedResponse,
  SlotGenerationRequest,
  SlotGenerationResponse,
  CheckAvailabilityRequest,
  AvailabilityResponse,
  RescheduleAppointmentValues,
} from './appointment.types';

// --- CRUD Hooks ---

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<{ id: string; name: string }>>('/organization/branches');
      return data;
    },
  });
}

export function useAppointments(params?: any) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', { params });
      return data;
    },
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const response = await apiClient.post<{ success: boolean; data: Appointment }>('/appointments', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    },
  });
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AppointmentFormValues>) => {
      const response = await apiClient.put<{ success: boolean; data: Appointment }>(`/appointments/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    },
  });
}

// --- Scheduling Hooks ---

export function useGenerateSlots() {
  return useMutation({
    mutationFn: async (data: SlotGenerationRequest) => {
      const response = await apiClient.post<SlotGenerationResponse>('/scheduling/generate-slots', data);
      return response.data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate slots');
    },
  });
}

export function useCheckAvailability() {
  return useMutation({
    mutationFn: async (data: CheckAvailabilityRequest) => {
      const response = await apiClient.post<AvailabilityResponse>('/scheduling/check-availability', data);
      return response.data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check availability');
    },
  });
}

// --- Operations Hooks ---

export function useConfirmAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/appointments/${id}/confirm`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment confirmed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm appointment');
    },
  });
}

export function useCheckInAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/appointments/${id}/check-in`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment checked in');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in appointment');
    },
  });
}

export function useStartAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/appointments/${id}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start appointment');
    },
  });
}

export function useCompleteAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/appointments/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment completed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    },
  });
}

export function useCancelAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cancellationReason: string) => {
      const response = await apiClient.patch(`/appointments/${id}/cancel`, { cancellationReason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });
}

export function useNoShowAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/appointments/${id}/no-show`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment marked as no-show');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as no-show');
    },
  });
}

export function useUpdateNotes(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { notes?: string; internalNotes?: string }) => {
      const response = await apiClient.patch(`/appointments/${id}/notes`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Notes updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update notes');
    },
  });
}

export function useRescheduleAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RescheduleAppointmentValues) => {
      const response = await apiClient.patch(`/appointments/${id}/reschedule`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Appointment rescheduled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    },
  });
}

export function useChangeEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { appointmentItemId: string; newEmployeeId: string }) => {
      const response = await apiClient.patch(`/appointments/${id}/change-employee`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Employee changed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change employee');
    },
  });
}

export function useChangeService(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { appointmentItemId: string; newServiceId: string }) => {
      const response = await apiClient.patch(`/appointments/${id}/change-service`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      toast.success('Service changed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change service');
    },
  });
}
