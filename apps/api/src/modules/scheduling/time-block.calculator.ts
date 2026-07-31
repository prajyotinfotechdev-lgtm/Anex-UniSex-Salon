import { TimeBlock, OccupiedTimeBlock, ServiceDurationMetrics } from './scheduling.types';

export class TimeBlockCalculator {
  
  /**
   * Calculates the full occupied window for a service, including buffers.
   */
  static calculateOccupiedWindow(startTime: Date, metrics: ServiceDurationMetrics): OccupiedTimeBlock {
    const totalMinutes = 
      metrics.beforeBufferMinutes + 
      metrics.durationMinutes + 
      (metrics.processingMinutes || 0) + 
      (metrics.cleanupMinutes || 0) + 
      metrics.afterBufferMinutes;

    const actualStart = new Date(startTime.getTime() - metrics.beforeBufferMinutes * 60000);
    const actualEnd = new Date(actualStart.getTime() + totalMinutes * 60000);

    return {
      startTime: actualStart,
      endTime: actualEnd,
      type: 'APPOINTMENT',
      metadata: { originalStartTime: startTime }
    };
  }

  /**
   * Checks if two time blocks overlap.
   */
  static doBlocksOverlap(block1: TimeBlock, block2: TimeBlock): boolean {
    return block1.startTime < block2.endTime && block1.endTime > block2.startTime;
  }

  /**
   * Checks if block1 is entirely contained within block2.
   */
  static isContained(block1: TimeBlock, container: TimeBlock): boolean {
    return block1.startTime >= container.startTime && block1.endTime <= container.endTime;
  }

  /**
   * Merges a list of potentially overlapping occupied time blocks into contiguous chunks.
   */
  static mergeBlocks(blocks: OccupiedTimeBlock[]): OccupiedTimeBlock[] {
    if (blocks.length === 0) return [];
    
    // Sort by start time
    const sorted = [...blocks].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    const merged: OccupiedTimeBlock[] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];
      
      if (current.startTime <= last.endTime) {
        // Overlap, extend the last block
        if (current.endTime > last.endTime) {
          last.endTime = current.endTime;
        }
      } else {
        // No overlap
        merged.push(current);
      }
    }
    
    return merged;
  }
}
