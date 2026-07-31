import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.client';

export class ReportAggregator {
  /**
   * Helper to aggregate payments by a specific date truncation (day, week, month, year).
   * Note: This uses raw SQL for grouping by date truncations in PostgreSQL.
   */
  static async aggregateRevenueByPeriod(
    organizationId: string,
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date,
    branchId?: string
  ): Promise<{ date: string; revenue: number }[]> {
    
    // We join Payment -> Invoice -> Branch to ensure org isolation
    // Use raw query for DATE_TRUNC
    const query = Prisma.sql`
      SELECT 
        DATE_TRUNC(${period}, p."paymentDate") as date,
        SUM(p.amount) as revenue
      FROM "Payment" p
      JOIN "Invoice" i ON p."invoiceId" = i.id
      JOIN "Branch" b ON i."branchId" = b.id
      WHERE b."organizationId" = ${organizationId}::uuid
        AND p."status" = 'COMPLETED'
        AND p."paymentDate" >= ${startDate}
        AND p."paymentDate" <= ${endDate}
        ${branchId ? Prisma.sql`AND b.id = ${branchId}::uuid` : Prisma.empty}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const result: any[] = await prisma.$queryRaw(query);
    
    return result.map(r => ({
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
      revenue: Number(r.revenue) || 0
    }));
  }
}
