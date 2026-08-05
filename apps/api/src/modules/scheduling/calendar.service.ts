import { DayOfWeek } from '@anex/database';
import { SchedulingRepository } from './scheduling.repository';
import { TimeBlock } from './scheduling.types';

export class CalendarService {
  private repo = new SchedulingRepository();

  /**
   * Retrieves the open time blocks for a specific employee on a specific date,
   * accounting for both EmployeeAvailability and CalendarExceptions (branch closures).
   */
  async getEmployeeOpenBlocks(branchId: string, employeeId: string, date: Date): Promise<TimeBlock[]> {
    const dayOfWeek = this.getDayOfWeek(date);
    
    // 1. Get raw availability
    let availabilities = await this.repo.getEmployeeAvailability(employeeId, dayOfWeek);
    if (availabilities.length === 0) {
      availabilities = [
        {
          id: 'default',
          employeeId,
          dayOfWeek,
          startTime: '09:00',
          endTime: '21:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any
      ];
    }

    // 2. Get exceptions (branch closures)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const exceptions = await this.repo.getCalendarExceptions(branchId, startOfDay, endOfDay);
    
    // If there is a full-day closure, return empty array
    const fullDayClosure = exceptions.find(e => e.isClosed && (!e.startTime || !e.endTime));
    if (fullDayClosure) return [];

    // Map availabilities to exact TimeBlocks on this date
    let openBlocks: TimeBlock[] = availabilities.map(a => ({
      startTime: this.applyTimeToDate(date, a.startTime),
      endTime: this.applyTimeToDate(date, a.endTime),
    }));

    // Subtract partial day closures
    const partialClosures = exceptions.filter(e => e.isClosed && e.startTime && e.endTime);
    for (const closure of partialClosures) {
      const closureStart = this.applyTimeToDate(date, closure.startTime!);
      const closureEnd = this.applyTimeToDate(date, closure.endTime!);
      
      openBlocks = this.subtractTimeBlock(openBlocks, { startTime: closureStart, endTime: closureEnd });
    }

    return openBlocks;
  }

  private subtractTimeBlock(blocks: TimeBlock[], subtract: TimeBlock): TimeBlock[] {
    const result: TimeBlock[] = [];
    
    for (const block of blocks) {
      if (subtract.endTime <= block.startTime || subtract.startTime >= block.endTime) {
        // No overlap
        result.push(block);
      } else if (subtract.startTime <= block.startTime && subtract.endTime >= block.endTime) {
        // Completely covers, block is removed
        continue;
      } else if (subtract.startTime > block.startTime && subtract.endTime < block.endTime) {
        // Splits the block in two
        result.push({ startTime: block.startTime, endTime: subtract.startTime });
        result.push({ startTime: subtract.endTime, endTime: block.endTime });
      } else if (subtract.startTime <= block.startTime && subtract.endTime < block.endTime) {
        // Overlaps the start
        result.push({ startTime: subtract.endTime, endTime: block.endTime });
      } else if (subtract.startTime > block.startTime && subtract.endTime >= block.endTime) {
        // Overlaps the end
        result.push({ startTime: block.startTime, endTime: subtract.startTime });
      }
    }
    
    return result;
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days = [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY];
    return days[date.getUTCDay()];
  }

  private applyTimeToDate(date: Date, timeString: string): Date {
    // timeString is expected to be "HH:mm" or "HH:mm:ss"
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
  }
}
