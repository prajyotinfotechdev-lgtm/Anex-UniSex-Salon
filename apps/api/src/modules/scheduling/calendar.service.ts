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
    
    // 1. Get raw branch availability (universal salon hours)
    const workingHour = await this.repo.getBranchWorkingHours(branchId, dayOfWeek);
    
    // If branch working hour is configured and is closed, return no slots
    if (workingHour && !workingHour.isOpen) {
      return [];
    }

    let startTimeStr = '09:00';
    let endTimeStr = '21:00';

    if (workingHour) {
      const formatTime = (dateVal: any): string => {
        if (dateVal instanceof Date) {
          const hours = String(dateVal.getUTCHours()).padStart(2, '0');
          const minutes = String(dateVal.getUTCMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        }
        if (typeof dateVal === 'string') {
          return dateVal.substring(0, 5);
        }
        return '09:00';
      };

      if (workingHour.openTime) {
        startTimeStr = formatTime(workingHour.openTime);
      }
      if (workingHour.closeTime) {
        endTimeStr = formatTime(workingHour.closeTime);
      }
    }

    // Map branch hours to exact TimeBlock on this date
    let openBlocks: TimeBlock[] = [
      {
        startTime: this.applyTimeToDate(date, startTimeStr),
        endTime: this.applyTimeToDate(date, endTimeStr)
      }
    ];

    // 2. Get exceptions (branch closures)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const exceptions = await this.repo.getCalendarExceptions(branchId, startOfDay, endOfDay);
    
    // If there is a full-day closure, return empty array
    const fullDayClosure = exceptions.find(e => e.isClosed && (!e.startTime || !e.endTime));
    if (fullDayClosure) return [];

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
    return days[date.getDay()];
  }

  private applyTimeToDate(date: Date, timeString: string): Date {
    // timeString is expected to be "HH:mm" or "HH:mm:ss"
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}
