import { BaseService } from '../../services/BaseService';
import { OrganizationRepository, BranchRepository, HolidayRepository } from './organization.repository';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@prisma/client';
import { NotFoundError, UnauthorizedError } from '../../errors/AppErrors';
import {
  UpdateOrganizationRequestDto,
  CreateBranchRequestDto,
  UpdateBranchRequestDto,
  CreateHolidayRequestDto,
  UpdateHolidayRequestDto,
  OrganizationResponseDto,
  BranchResponseDto,
  HolidayResponseDto,
} from './organization.dto';

export class OrganizationService extends BaseService {
  private orgRepo: OrganizationRepository;
  private branchRepo: BranchRepository;
  private holidayRepo: HolidayRepository;

  constructor() {
    super();
    this.orgRepo = new OrganizationRepository();
    this.branchRepo = new BranchRepository();
    this.holidayRepo = new HolidayRepository();
  }

  private async auditLog(
    organizationId: string,
    action: ActionType,
    entityName: string,
    entityId: string,
    userId: string,
    details?: Record<string, any>
  ) {
    try {
      await AuditService.log({
        organizationId,
        action,
        entityName,
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  // --- Organization ---

  async getOrganization(organizationId: string): Promise<OrganizationResponseDto> {
    const org = await this.orgRepo.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');
    return org as OrganizationResponseDto;
  }

  async updateOrganization(
    organizationId: string,
    userId: string,
    data: UpdateOrganizationRequestDto
  ): Promise<OrganizationResponseDto> {
    const org = await this.orgRepo.update(organizationId, data);
    await this.auditLog(organizationId, ActionType.UPDATE, 'Organization', organizationId, userId, data);
    return org as OrganizationResponseDto;
  }

  // --- Branch ---

  async listBranches(organizationId: string): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepo.findMany({
      where: { organizationId, deletedAt: null },
    });
    return branches as BranchResponseDto[];
  }

  async getBranch(organizationId: string, branchId: string): Promise<BranchResponseDto> {
    const branch = await this.branchRepo.findById(branchId);
    if (!branch || branch.organizationId !== organizationId || branch.deletedAt !== null) {
      throw new NotFoundError('Branch not found');
    }
    return branch as BranchResponseDto;
  }

  async createBranch(
    organizationId: string,
    userId: string,
    data: CreateBranchRequestDto
  ): Promise<BranchResponseDto> {
    const branch = await this.branchRepo.create({
      organization: { connect: { id: organizationId } },
      name: data.name,
      address: data.address,
      phone: data.phone,
      timeZone: data.timeZone || 'UTC',
      isActive: data.isActive ?? true,
    });
    await this.auditLog(organizationId, ActionType.CREATE, 'Branch', branch.id, userId, { name: data.name });
    return branch as BranchResponseDto;
  }

  async updateBranch(
    organizationId: string,
    branchId: string,
    userId: string,
    data: UpdateBranchRequestDto
  ): Promise<BranchResponseDto> {
    await this.getBranch(organizationId, branchId); // Validate exists
    const branch = await this.branchRepo.update(branchId, data);
    await this.auditLog(organizationId, ActionType.UPDATE, 'Branch', branch.id, userId, data);
    return branch as BranchResponseDto;
  }

  async deleteBranch(organizationId: string, branchId: string, userId: string): Promise<void> {
    await this.getBranch(organizationId, branchId); // Validate exists
    await this.branchRepo.softDelete(branchId);
    await this.auditLog(organizationId, ActionType.DELETE, 'Branch', branchId, userId, { reason: 'Soft Delete' });
  }

  async activateBranch(organizationId: string, branchId: string, userId: string): Promise<void> {
    await this.getBranch(organizationId, branchId);
    await this.branchRepo.update(branchId, { isActive: true });
    await this.auditLog(organizationId, ActionType.UPDATE, 'Branch', branchId, userId, { isActive: true });
  }

  async deactivateBranch(organizationId: string, branchId: string, userId: string): Promise<void> {
    await this.getBranch(organizationId, branchId);
    await this.branchRepo.update(branchId, { isActive: false });
    await this.auditLog(organizationId, ActionType.UPDATE, 'Branch', branchId, userId, { isActive: false });
  }

  // --- Holidays (Calendar Exceptions) ---

  async listHolidays(organizationId: string, branchId: string): Promise<HolidayResponseDto[]> {
    await this.getBranch(organizationId, branchId); // Validate branch exists and belongs to org
    const holidays = await this.holidayRepo.findMany({
      where: { branchId },
    });
    return holidays as HolidayResponseDto[];
  }

  async createHoliday(
    organizationId: string,
    branchId: string,
    userId: string,
    data: CreateHolidayRequestDto
  ): Promise<HolidayResponseDto> {
    await this.getBranch(organizationId, branchId); // Validate
    const holiday = await this.holidayRepo.create({
      branch: { connect: { id: branchId } },
      date: new Date(data.date),
      isClosed: data.isClosed ?? true,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
    });
    await this.auditLog(organizationId, ActionType.CREATE, 'CalendarException', holiday.id, userId, data);
    return holiday as HolidayResponseDto;
  }

  async updateHoliday(
    organizationId: string,
    branchId: string,
    holidayId: string,
    userId: string,
    data: UpdateHolidayRequestDto
  ): Promise<HolidayResponseDto> {
    await this.getBranch(organizationId, branchId); // Validate
    const existing = await this.holidayRepo.findById(holidayId);
    if (!existing || existing.branchId !== branchId) {
      throw new NotFoundError('Holiday not found');
    }

    const holiday = await this.holidayRepo.update(holidayId, {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.isClosed !== undefined && { isClosed: data.isClosed }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.reason !== undefined && { reason: data.reason }),
    });

    await this.auditLog(organizationId, ActionType.UPDATE, 'CalendarException', holiday.id, userId, data);
    return holiday as HolidayResponseDto;
  }

  async deleteHoliday(
    organizationId: string,
    branchId: string,
    holidayId: string,
    userId: string
  ): Promise<void> {
    await this.getBranch(organizationId, branchId); // Validate
    const existing = await this.holidayRepo.findById(holidayId);
    if (!existing || existing.branchId !== branchId) {
      throw new NotFoundError('Holiday not found');
    }

    await this.holidayRepo.delete(holidayId);
    await this.auditLog(organizationId, ActionType.DELETE, 'CalendarException', holidayId, userId, { reason: 'Deleted' });
  }
}
