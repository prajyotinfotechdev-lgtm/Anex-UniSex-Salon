export interface DateRangeInput {
  startDate: Date;
  endDate: Date;
}

export interface BaseReportFilters extends DateRangeInput {
  branchId?: string;
  employeeId?: string;
  customerId?: string;
  serviceId?: string;
}
