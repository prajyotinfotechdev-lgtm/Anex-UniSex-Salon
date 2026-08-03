import { z } from 'zod';
import { ConsultationType } from '@prisma/client';

export const SaveConsultationDto = z.object({
  customerId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  type: z.nativeEnum(ConsultationType),
  
  // Specific payload based on type
  hairConsultation: z.object({
    hairLength: z.string().optional(),
    hairType: z.string().optional(),
    chemicalHistory: z.string().optional(),
    hairDensity: z.string().optional(),
    currentCondition: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),

  skinConsultation: z.object({
    skinType: z.string().optional(),
    sensitivity: z.string().optional(),
    skinConcerns: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),

  medicalConsultation: z.object({
    allergies: z.string().optional(),
    contraindications: z.string().optional(),
    medicalNotes: z.string().optional(),
  }).optional(),
});

export type SaveConsultationInput = z.infer<typeof SaveConsultationDto>;

export const DetermineRequirementsDto = z.object({
  customerId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()),
});

export type DetermineRequirementsInput = z.infer<typeof DetermineRequirementsDto>;
