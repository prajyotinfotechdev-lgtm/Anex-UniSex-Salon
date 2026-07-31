import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AnalyticsService } from './analytics.service';
import { BaseReportFilterQueryDto } from './reports.dto';
import { ExportUtil } from './export.util';
import { successResponse } from '@anex/shared';

const dashboardService = new DashboardService();
const analyticsService = new AnalyticsService();

const handleExport = (res: Response, data: any, format: string, filename: string) => {
  if (format === 'csv') {
    const csvStr = ExportUtil.toCSV(Array.isArray(data) ? data : [data]);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filename}.csv`);
    return res.send(csvStr);
  }
  return res.status(200).json(successResponse('Report generated', data));
};

export const getDashboardSummaryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.query as { branchId?: string };
    const data = await dashboardService.getDashboardSummary(req.user!.organizationId, branchId);
    return res.status(200).json(successResponse('Dashboard summary fetched', data));
  } catch (error) {
    next(error);
  }
};

export const getRevenueReportHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as BaseReportFilterQueryDto;
    const filters = {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      branchId: query.branchId,
    };
    const data = await analyticsService.getRevenueReport(req.user!.organizationId, filters);
    return handleExport(res, data, query.format, 'revenue-report');
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrendHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as BaseReportFilterQueryDto;
    const filters = {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      branchId: query.branchId,
    };
    const data = await analyticsService.getRevenueTrend(req.user!.organizationId, query.period, filters);
    return handleExport(res, data, query.format, 'revenue-trend');
  } catch (error) {
    next(error);
  }
};

export const getEmployeePerformanceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as BaseReportFilterQueryDto;
    const filters = {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      branchId: query.branchId,
    };
    const data = await analyticsService.getEmployeePerformanceReport(req.user!.organizationId, filters);
    return handleExport(res, data, query.format, 'employee-performance');
  } catch (error) {
    next(error);
  }
};
