import { Request, Response } from 'express';
import { AppointmentBookingService } from './appointment-booking.service';
import { StartBookingDto, CheckRequirementsDto, ConfirmBookingDto } from './appointment-booking.dto';

export class AppointmentBookingController {
  private readonly bookingService = new AppointmentBookingService();

  startBooking = async (req: Request, res: Response) => {
    const data = StartBookingDto.parse(req.body);
    const organizationId = (req as any).tenant?.organizationId || (req as any).user?.organizationId || (req as any).customer?.organizationId;
    const actorId = (req as any).user?.id || (req as any).customer?.customerId;
    const isCustomer = !(req as any).user;

    if (isCustomer && data.customerId !== actorId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only book appointments for yourself.' });
      return;
    }

    const result = await this.bookingService.startBooking(organizationId, actorId, data);
    res.status(200).json({ success: true, data: result });
  };

  checkRequirements = async (req: Request, res: Response) => {
    const data = CheckRequirementsDto.parse(req.body);
    const actorId = (req as any).user?.id || (req as any).customer?.customerId;
    const isCustomer = !(req as any).user;

    if (isCustomer && req.params.customerId !== actorId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only check requirements for yourself.' });
      return;
    }

    const result = await this.bookingService.checkRequirements(req.params.customerId, data);
    res.status(200).json({ success: true, data: result });
  };

  confirmBooking = async (req: Request, res: Response) => {
    const data = ConfirmBookingDto.parse(req.body);
    const organizationId = (req as any).tenant?.organizationId || (req as any).user?.organizationId || (req as any).customer?.organizationId;
    const actorId = (req as any).user?.id || (req as any).customer?.customerId;

    // To prevent customers from confirming someone else's draft, they shouldn't even know the draft ID.
    // However, since confirmBookingDto doesn't have customerId, we'll let the service layer handle or assume draft possession.
    const result = await this.bookingService.confirmBooking(organizationId, actorId, data);
    res.status(200).json({ success: true, data: result });
  };
}
