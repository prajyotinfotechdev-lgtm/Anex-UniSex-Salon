import { Request, Response } from 'express';
import { AppointmentBookingService } from './appointment-booking.service';
import { StartBookingDto, CheckRequirementsDto, ConfirmBookingDto } from './appointment-booking.dto';

export class AppointmentBookingController {
  private readonly bookingService = new AppointmentBookingService();

  startBooking = async (req: Request, res: Response) => {
    const data = StartBookingDto.parse(req.body);
    // @ts-ignore - Assuming tenant context middleware sets this
    const organizationId = req.tenant?.organizationId || req.user?.organizationId;
    // @ts-ignore
    const userId = req.user?.id;

    const result = await this.bookingService.startBooking(organizationId, userId, data);
    res.status(200).json({ success: true, data: result });
  };

  checkRequirements = async (req: Request, res: Response) => {
    const data = CheckRequirementsDto.parse(req.body);
    const result = await this.bookingService.checkRequirements(req.params.customerId, data);
    res.status(200).json({ success: true, data: result });
  };

  confirmBooking = async (req: Request, res: Response) => {
    const data = ConfirmBookingDto.parse(req.body);
    // @ts-ignore
    const organizationId = req.tenant?.organizationId || req.user?.organizationId;
    // @ts-ignore
    const userId = req.user?.id;

    const result = await this.bookingService.confirmBooking(organizationId, userId, data);
    res.status(200).json({ success: true, data: result });
  };
}
