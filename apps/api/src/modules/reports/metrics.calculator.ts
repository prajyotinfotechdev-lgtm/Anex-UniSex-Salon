export class MetricsCalculator {
  /**
   * Calculates the percentage growth from previous to current value.
   * Handles edge cases like zero divisors.
   */
  static calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    const growth = ((current - previous) / previous) * 100;
    return this.round(growth, 2);
  }

  /**
   * Calculates a ratio.
   */
  static calculateRatio(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return this.round(numerator / denominator, 2);
  }

  /**
   * Calculates percentage of a part to a total.
   */
  static calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return this.round((part / total) * 100, 2);
  }

  /**
   * Calculates average.
   */
  static calculateAverage(totalValue: number, count: number): number {
    if (count === 0) return 0;
    return this.round(totalValue / count, 2);
  }

  /**
   * Calculates trend indicator: 1 for upward, -1 for downward, 0 for flat.
   */
  static calculateTrend(current: number, previous: number): number {
    if (current > previous) return 1;
    if (current < previous) return -1;
    return 0;
  }

  private static round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
