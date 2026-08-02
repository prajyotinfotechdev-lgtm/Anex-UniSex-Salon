import { BaseService } from '../../services/BaseService';
import { EmployeeRepository } from './employee.repository';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@anex/database';
import { NotFoundError, ConflictError, ValidationError } from '../../errors/AppErrors';
import {
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  SearchEmployeesQueryDto,
  EmployeeResponseDto,
} from './employee.dto';

export class EmployeeService extends BaseService {
  private repo: EmployeeRepository;

  constructor() {
    super();
    this.repo = new EmployeeRepository();
  }

  private async auditLog(
    organizationId: string,
    action: ActionType,
    entityId: string,
    userId: string,
    details?: Record<string, any>
  ) {
    try {
      await AuditService.log({
        organizationId,
        action,
        entityName: 'Employee',
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  private async validateUniqueConstraints(organizationId: string, email?: string | null, phone?: string | null, excludeEmployeeId?: string) {
    if (email) {
      const existingEmail = await this.repo.findByEmail(email, organizationId);
      if (existingEmail && existingEmail.id !== excludeEmployeeId) {
        throw new ConflictError('Email is already assigned to another employee');
      }
    }
    if (phone) {
      const existingPhone = await this.repo.findByPhone(phone, organizationId);
      if (existingPhone && existingPhone.id !== excludeEmployeeId) {
        throw new ConflictError('Phone number is already assigned to another employee');
      }
    }
  }

  private async validateUserAndRole(organizationId: string, roleId?: string, userId?: string | null, excludeEmployeeId?: string) {
    if (roleId) {
      const role = await this.repo.checkRoleExists(roleId, organizationId);
      if (!role) throw new NotFoundError('Role not found or is inactive in this organization');
    }

    if (userId) {
      const user = await this.repo.checkUserExists(userId, organizationId);
      if (!user) throw new NotFoundError('User not found or is inactive in this organization');

      const existingLinked = await this.repo.checkUserLinked(userId, excludeEmployeeId);
      if (existingLinked) throw new ConflictError('User is already linked to another employee');
    }
  }

  private async validateBranches(organizationId: string, branches: { branchId: string, isPrimary: boolean }[]) {
    if (!branches || branches.length === 0) return;

    const uniqueBranchIds = [...new Set(branches.map(b => b.branchId))];
    if (uniqueBranchIds.length !== branches.length) {
      throw new ValidationError('Duplicate branch assignments are not allowed');
    }

    const primaryCount = branches.filter(b => b.isPrimary).length;
    if (primaryCount > 1) {
      throw new ValidationError('Only one primary branch can be assigned');
    }

    const validBranches = await this.repo.checkBranchesExist(uniqueBranchIds, organizationId);
    if (validBranches.length !== uniqueBranchIds.length) {
      throw new NotFoundError('One or more branches do not exist or are inactive in this organization');
    }
  }

  async searchEmployees(organizationId: string, params: SearchEmployeesQueryDto) {
    return this.repo.search(organizationId, params);
  }

  async getEmployeeById(organizationId: string, employeeId: string): Promise<EmployeeResponseDto> {
    const employee = await this.repo.findByIdAndOrg(employeeId, organizationId);
    if (!employee) throw new NotFoundError('Employee not found');
    return employee as EmployeeResponseDto;
  }

  async createEmployee(organizationId: string, actorUserId: string, data: CreateEmployeeRequestDto): Promise<EmployeeResponseDto> {
    await this.validateUniqueConstraints(organizationId, data.email, data.phone);
    await this.validateUserAndRole(organizationId, data.roleId, data.userId);
    if (data.branches) {
      await this.validateBranches(organizationId, data.branches);
    }

    const { branches, ...employeeData } = data;

    const employee = await this.repo.create({
      organization: { connect: { id: organizationId } },
      role: { connect: { id: data.roleId } },
      ...(data.userId && { user: { connect: { id: data.userId } } }),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      ...(data.profileImageId && { profileImage: { connect: { id: data.profileImageId } } }),
      dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : null,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      calendarColor: data.calendarColor,
      isActive: data.isActive ?? true,
      ...(branches && branches.length > 0 && {
        employeeBranches: {
          create: branches.map(b => ({
            branchId: b.branchId,
            isPrimary: b.isPrimary
          }))
        }
      })
    });

    await this.auditLog(organizationId, ActionType.CREATE, employee.id, actorUserId, { email: employee.email });
    return employee as EmployeeResponseDto;
  }

  async updateEmployee(organizationId: string, employeeId: string, actorUserId: string, data: UpdateEmployeeRequestDto): Promise<EmployeeResponseDto> {
    const existing = await this.getEmployeeById(organizationId, employeeId);

    await this.validateUniqueConstraints(organizationId, data.email, data.phone, employeeId);
    await this.validateUserAndRole(organizationId, data.roleId, data.userId, employeeId);
    
    if (data.branches) {
      await this.validateBranches(organizationId, data.branches);
      await this.repo.setBranches(employeeId, data.branches);
    }

    const { branches, ...updateData } = data;

    const employee = await this.repo.update(employeeId, {
      ...(updateData.roleId && { role: { connect: { id: updateData.roleId } } }),
      ...(updateData.userId !== undefined && { 
        user: updateData.userId ? { connect: { id: updateData.userId } } : { disconnect: true } 
      }),
      ...(updateData.firstName && { firstName: updateData.firstName }),
      ...(updateData.lastName && { lastName: updateData.lastName }),
      ...(updateData.email !== undefined && { email: updateData.email }),
      ...(updateData.phone !== undefined && { phone: updateData.phone }),
      ...(updateData.bio !== undefined && { bio: updateData.bio }),
      ...(updateData.profileImageId !== undefined && { profileImage: updateData.profileImageId ? { connect: { id: updateData.profileImageId } } : { disconnect: true } }),
      ...(updateData.dateOfJoining !== undefined && { dateOfJoining: updateData.dateOfJoining ? new Date(updateData.dateOfJoining) : null }),
      ...(updateData.emergencyContactName !== undefined && { emergencyContactName: updateData.emergencyContactName }),
      ...(updateData.emergencyContactPhone !== undefined && { emergencyContactPhone: updateData.emergencyContactPhone }),
      ...(updateData.calendarColor !== undefined && { calendarColor: updateData.calendarColor }),
      ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
    });

    await this.auditLog(organizationId, ActionType.UPDATE, employee.id, actorUserId, updateData);
    return employee as EmployeeResponseDto;
  }

  private async checkDeactivationDependencies(employeeId: string) {
    // For future: Check active appointments, active schedules etc.
    // Throw ConflictError if dependencies exist.
    // Example stub:
    // const hasAppointments = await this.appointmentRepo.hasActiveAppointments(employeeId);
    // if (hasAppointments) throw new ConflictError('Cannot deactivate employee with active appointments');
    return true; // currently no dependencies implemented
  }

  async deactivateEmployee(organizationId: string, employeeId: string, actorUserId: string): Promise<void> {
    await this.getEmployeeById(organizationId, employeeId);
    await this.checkDeactivationDependencies(employeeId);
    
    await this.repo.update(employeeId, { isActive: false });
    await this.auditLog(organizationId, ActionType.UPDATE, employeeId, actorUserId, { isActive: false });
  }

  async activateEmployee(organizationId: string, employeeId: string, actorUserId: string): Promise<void> {
    await this.getEmployeeById(organizationId, employeeId);
    await this.repo.update(employeeId, { isActive: true });
    await this.auditLog(organizationId, ActionType.UPDATE, employeeId, actorUserId, { isActive: true });
  }

  async deleteEmployee(organizationId: string, employeeId: string, actorUserId: string): Promise<void> {
    await this.getEmployeeById(organizationId, employeeId);
    await this.checkDeactivationDependencies(employeeId);

    await this.repo.softDelete(employeeId);
    await this.auditLog(organizationId, ActionType.DELETE, employeeId, actorUserId, { reason: 'Soft Delete' });
  }
}
