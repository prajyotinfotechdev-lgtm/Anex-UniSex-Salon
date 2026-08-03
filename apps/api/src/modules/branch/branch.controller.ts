import { Request, Response } from 'express';
import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto, UpsertWorkingHoursDto, CreateHolidayDto } from './branch.dto';

export class BranchController {
  private service: BranchService;

  constructor() {
    this.service = new BranchService();
  }

  // --- BRANCHES ---
  listBranches = async (req: Request, res: Response) => {
    const data = await this.service.listBranches();
    res.json({ success: true, data });
  };

  getBranch = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const data = await this.service.getBranch(branchId);
    res.json({ success: true, data });
  };

  createBranch = async (req: Request, res: Response) => {
    const dto: CreateBranchDto = req.body;
    const data = await this.service.createBranch(dto);
    res.status(201).json({ success: true, data });
  };

  updateBranch = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const dto: UpdateBranchDto = req.body;
    const data = await this.service.updateBranch(branchId, dto);
    res.json({ success: true, data });
  };

  deleteBranch = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    await this.service.deleteBranch(branchId);
    res.json({ success: true, message: 'Branch deleted successfully' });
  };

  // --- WORKING HOURS ---
  upsertWorkingHours = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const dto: UpsertWorkingHoursDto = req.body;
    const data = await this.service.upsertWorkingHours(branchId, dto);
    res.json({ success: true, data });
  };

  // --- HOLIDAYS ---
  createHoliday = async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const dto: CreateHolidayDto = req.body;
    const data = await this.service.createHoliday(branchId, dto);
    res.status(201).json({ success: true, data });
  };

  deleteHoliday = async (req: Request, res: Response) => {
    const { branchId, holidayId } = req.params;
    await this.service.deleteHoliday(branchId, holidayId);
    res.json({ success: true, message: 'Holiday deleted successfully' });
  };
}
