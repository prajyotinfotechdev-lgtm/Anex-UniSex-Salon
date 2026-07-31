import { z } from 'zod';
import { checkAvailabilitySchema, generateSlotsSchema } from './scheduling.validator';

export type CheckAvailabilityRequestDto = z.infer<typeof checkAvailabilitySchema>['body'];
export type GenerateSlotsRequestDto = z.infer<typeof generateSlotsSchema>['body'];
