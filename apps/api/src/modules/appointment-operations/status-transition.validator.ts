import { AppointmentStatus } from '@prisma/client';
import { ConflictError } from '../../errors/AppErrors';

export class StatusTransitionValidator {
  /**
   * Validates if a transition from oldStatus to newStatus is allowed.
   * Throws a ConflictError if invalid.
   */
  static validate(oldStatus: AppointmentStatus, newStatus: AppointmentStatus): void {
    if (oldStatus === newStatus) return; // No change

    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.ARRIVED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ],
      [AppointmentStatus.ARRIVED]: [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED, // Sometimes customers leave before service starts
        AppointmentStatus.NO_SHOW,
      ],
      [AppointmentStatus.IN_PROGRESS]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.COMPLETED]: [], // Cannot change once completed
      [AppointmentStatus.CANCELLED]: [], // Cannot change once cancelled
      [AppointmentStatus.NO_SHOW]: [], // Cannot change once marked no-show
    };

    const allowed = validTransitions[oldStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new ConflictError(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    }
  }
}
