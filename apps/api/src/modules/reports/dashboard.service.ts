import { BaseService } from '../../services/BaseService';
import { ReportsRepository } from './reports.repository';

export class DashboardService extends BaseService {
  private repo = new ReportsRepository();

  async getDashboardSummary(organizationId: string, branchId?: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const summary = await this.repo.getDashboardSummary(organizationId, todayStart, todayEnd, branchId);
    
    return summary;
  }
}
