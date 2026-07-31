import { OccupiedTimeBlock, ConflictReason, ConflictType } from './scheduling.types';
import { TimeBlockCalculator } from './time-block.calculator';

export class ConflictDetectionService {
  
  /**
   * Detects conflicts between a requested window (with buffers) and existing occupied blocks.
   * Return a list of all detected conflicts.
   */
  detectConflicts(requestedWindow: OccupiedTimeBlock, existingBlocks: OccupiedTimeBlock[]): ConflictReason[] {
    const conflicts: ConflictReason[] = [];

    for (const block of existingBlocks) {
      if (!TimeBlockCalculator.doBlocksOverlap(requestedWindow, block)) {
        continue;
      }

      // Determine the specific type of conflict
      const type = this.determineConflictType(requestedWindow, block);
      
      conflicts.push({
        type,
        message: `Conflict detected: ${type} overlap with an existing ${block.type} block.`,
        conflictingBlock: block,
      });
    }

    return conflicts;
  }

  private determineConflictType(requested: OccupiedTimeBlock, existing: OccupiedTimeBlock): ConflictType {
    const rStart = requested.startTime.getTime();
    const rEnd = requested.endTime.getTime();
    const eStart = existing.startTime.getTime();
    const eEnd = existing.endTime.getTime();

    if (rStart === eStart && rEnd === eEnd) {
      return 'EXACT';
    }

    if (rStart >= eStart && rEnd <= eEnd) {
      return 'CONTAINED'; // Requested is fully contained within existing
    }

    if (eStart >= rStart && eEnd <= rEnd) {
      // Existing is contained within requested. But we refer to it often as partial or contained from perspective of requested.
      return 'PARTIAL';
    }

    // Only one edge overlaps
    if ((rStart < eStart && rEnd > eStart) || (rStart < eEnd && rEnd > eEnd)) {
      return 'PARTIAL';
    }

    // Default catch-all (should theoretically not hit if doBlocksOverlap is true, but safe fallback)
    return 'PARTIAL';
  }
}
