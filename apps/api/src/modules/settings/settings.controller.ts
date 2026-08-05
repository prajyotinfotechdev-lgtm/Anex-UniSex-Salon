import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { UpdateModuleDto, UpdateBrandingDto, UpdateInvoiceConfigDto } from './settings.dto';

export class SettingsController {
  private service: SettingsService;

  constructor() {
    this.service = new SettingsService();
  }

  // --- MODULES ---
  listModules = async (req: Request, res: Response) => {
    const modules = await this.service.listOrganizationModules();
    res.json({ success: true, data: modules });
  };

  updateModule = async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const dto: UpdateModuleDto = req.body;
    const updated = await this.service.updateOrganizationModule(moduleId, dto);
    res.json({ success: true, data: updated });
  };

  // --- BRANDING ---
  getBranding = async (req: Request, res: Response) => {
    const branding = await this.service.getBranding();
    res.json({ success: true, data: branding });
  };

  updateBranding = async (req: Request, res: Response) => {
    const dto: UpdateBrandingDto = req.body;
    const updated = await this.service.updateBranding(dto);
    res.json({ success: true, data: updated });
  };

  // --- INVOICE CONFIG ---
  getInvoiceConfig = async (req: Request, res: Response) => {
    const config = await this.service.getInvoiceConfig();
    res.json({ success: true, data: config });
  };

  updateInvoiceConfig = async (req: Request, res: Response) => {
    const dto: UpdateInvoiceConfigDto = req.body;
    const updated = await this.service.updateInvoiceConfig(dto);
    res.json({ success: true, data: updated });
  };

  // --- TAX GROUPS ---
  listTaxGroups = async (req: Request, res: Response) => {
    const data = await this.service.listTaxGroups();
    res.json({ success: true, data });
  };

  createTaxGroup = async (req: Request, res: Response) => {
    const data = await this.service.createTaxGroup(req.body);
    res.json({ success: true, data });
  };

  updateTaxGroup = async (req: Request, res: Response) => {
    const { taxGroupId } = req.params;
    const data = await this.service.updateTaxGroup(taxGroupId, req.body);
    res.json({ success: true, data });
  };

  deleteTaxGroup = async (req: Request, res: Response) => {
    const { taxGroupId } = req.params;
    await this.service.deleteTaxGroup(taxGroupId);
    res.json({ success: true, message: 'Tax group deleted' });
  };

  // --- CLOSURES & WORKING HOURS ---
  getBranchWorkingHours = async (req: Request, res: Response) => {
    const data = await this.service.getBranchWorkingHours();
    res.json({ success: true, data });
  };

  updateBranchWorkingHours = async (req: Request, res: Response) => {
    const data = await this.service.updateBranchWorkingHours(req.body.availabilities);
    res.json({ success: true, data });
  };

  listClosures = async (req: Request, res: Response) => {
    const data = await this.service.listClosures();
    res.json({ success: true, data });
  };

  createClosure = async (req: Request, res: Response) => {
    const data = await this.service.createClosure(req.body);
    res.json({ success: true, data });
  };

  deleteClosure = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteClosure(id);
    res.json({ success: true, message: 'Closure exception deleted' });
  };

  getEmployeeAvailability = async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const data = await this.service.getEmployeeAvailability(employeeId);
    res.json({ success: true, data });
  };

  updateEmployeeAvailability = async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const data = await this.service.updateEmployeeAvailability(employeeId, req.body.availabilities);
    res.json({ success: true, data });
  };

  // --- AUDIT LOGS ---
  getAuditLogs = async (req: Request, res: Response) => {
    const { organizationId } = req.user as any;
    // Basic fetch of recent logs
    const logs = await this.service.getAuditLogs(organizationId);
    res.json({ success: true, data: logs });
  };
}
