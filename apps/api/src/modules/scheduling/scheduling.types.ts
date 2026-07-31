export interface TimeBlock {
  startTime: Date;
  endTime: Date;
}

export interface OccupiedTimeBlock extends TimeBlock {
  appointmentId?: string;
  type: 'APPOINTMENT' | 'EXCEPTION' | 'BUFFER' | 'PROCESSING' | 'CLEANUP';
  metadata?: any;
}

export type ConflictType = 'EXACT' | 'PARTIAL' | 'CONTAINED' | 'ADJACENT' | 'BEFORE_BUFFER' | 'AFTER_BUFFER';

export interface ConflictReason {
  type: ConflictType;
  message: string;
  conflictingBlock: OccupiedTimeBlock;
}

export interface ServiceDurationMetrics {
  durationMinutes: number;
  processingMinutes: number;
  cleanupMinutes: number;
  beforeBufferMinutes: number;
  afterBufferMinutes: number;
}
