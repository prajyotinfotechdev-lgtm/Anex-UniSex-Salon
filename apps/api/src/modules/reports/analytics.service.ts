import { BaseService } from '../../services/BaseService';
import { ReportsRepository } from './reports.repository';
import { BaseReportFilters } from './reports.types';
import { MetricsCalculator } from './metrics.calculator';
import { ReportAggregator } from './report.aggregator';

export class AnalyticsService extends BaseService {
  private repo = new ReportsRepository();

  /**
   * Separated into specific methods so caching can be applied individually later.
   */

  async getRevenueReport(organizationId: string, filters: BaseReportFilters) {
    const summary = await this.repo.getRevenueSummary(organizationId, filters);
    
    // To calculate growth, we could fetch the previous period if needed, 
    // but for now we just return the total.
    return {
      totalRevenue: summary.totalRevenue
    };
  }

  async getRevenueTrend(organizationId: string, period: 'day' | 'week' | 'month' | 'year', filters: BaseReportFilters) {
    const data = await ReportAggregator.aggregateRevenueByPeriod(
      organizationId,
      period,
      filters.startDate,
      filters.endDate,
      filters.branchId
    );
    return data;
  }

  async getPaymentMethodBreakdown(organizationId: string, filters: BaseReportFilters) {
    return this.repo.getPaymentMethodBreakdown(organizationId, filters);
  }

  async getAppointmentStatusReport(organizationId: string, filters: BaseReportFilters) {
    return this.repo.getAppointmentsByStatus(organizationId, filters);
  }

  async getServicePerformanceReport(organizationId: string, filters: BaseReportFilters) {
    return this.repo.getServicePerformance(organizationId, filters);
  }

  async getEmployeePerformanceReport(organizationId: string, filters: BaseReportFilters) {
    const rawData = await this.repo.getEmployeePerformance(organizationId, filters);
    
    // Calculate Average Service Value using MetricsCalculator
    return rawData.map(data => ({
      ...data,
      averageServiceValue: MetricsCalculator.calculateAverage(data.serviceRevenue, data.appointmentsCount)
    }));
  }

  async getCustomerInsights(organizationId: string) {
    const topCustomers = await this.repo.getTopCustomers(organizationId, 20);
    return { topCustomers };
  }
}
