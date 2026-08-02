import { BaseService } from '../../services/BaseService';
import { ServiceRepository } from './service.repository';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@anex/database';
import { NotFoundError, ConflictError, ValidationError } from '../../errors/AppErrors';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
  SearchServicesQueryDto,
  ServiceResponseDto,
} from './service.dto';

export class ServiceCatalogService extends BaseService {
  private repo: ServiceRepository;

  constructor() {
    super();
    this.repo = new ServiceRepository();
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
        entityName: 'Service',
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  private async validateDuplicateName(organizationId: string, name: string, excludeServiceId?: string) {
    const existing = await this.repo.findByName(name, organizationId);
    if (existing && existing.id !== excludeServiceId) {
      throw new ConflictError('A service with this name already exists in the organization');
    }
  }

  private async validateCategory(organizationId: string, categoryId: string) {
    const category = await this.repo.checkCategoryExists(categoryId, organizationId);
    if (!category) {
      throw new NotFoundError('Service Category not found or is inactive in this organization');
    }
  }

  private async validateEmployees(organizationId: string, employeeIds?: string[]) {
    if (!employeeIds || employeeIds.length === 0) return;
    const uniqueIds = [...new Set(employeeIds)];
    const validEmployees = await this.repo.checkEmployeesExist(uniqueIds, organizationId);
    if (validEmployees.length !== uniqueIds.length) {
      throw new ValidationError('One or more employees do not exist or are inactive in this organization');
    }
  }

  private async validateBranches(organizationId: string, branches?: { branchId: string; price: number }[]) {
    if (!branches || branches.length === 0) return;
    const uniqueIds = [...new Set(branches.map(b => b.branchId))];
    const validBranches = await this.repo.checkBranchesExist(uniqueIds, organizationId);
    if (validBranches.length !== uniqueIds.length) {
      throw new ValidationError('One or more branches do not exist or are inactive in this organization');
    }
  }

  async searchServices(organizationId: string, params: SearchServicesQueryDto) {
    return this.repo.search(organizationId, params);
  }

  async getServiceById(organizationId: string, serviceId: string): Promise<ServiceResponseDto> {
    const service = await this.repo.findByIdWithDetails(serviceId, organizationId);
    if (!service) throw new NotFoundError('Service not found');
    return service as unknown as ServiceResponseDto;
  }

  async createService(organizationId: string, actorUserId: string, data: CreateServiceRequestDto): Promise<ServiceResponseDto> {
    await this.validateDuplicateName(organizationId, data.name);
    await this.validateCategory(organizationId, data.serviceCategoryId);
    
    if (data.employees) await this.validateEmployees(organizationId, data.employees);
    if (data.branches) await this.validateBranches(organizationId, data.branches);

    const { employees, branches, ...serviceData } = data;
    const uniqueEmployees = employees ? [...new Set(employees)] : [];
    const uniqueBranches = branches ? Object.values(branches.reduce((acc, current) => {
      acc[current.branchId] = current;
      return acc;
    }, {} as Record<string, { branchId: string; price: number }>)) : [];

    const service = await this.repo.create({
      organization: { connect: { id: organizationId } },
      serviceCategory: { connect: { id: serviceData.serviceCategoryId } },
      name: serviceData.name,
      description: serviceData.description,
      pricingType: serviceData.pricingType,
      basePrice: serviceData.basePrice,
      durationMinutes: serviceData.durationMinutes,
      processingMinutes: serviceData.processingMinutes,
      cleanupMinutes: serviceData.cleanupMinutes,
      beforeBufferMinutes: serviceData.beforeBufferMinutes,
      afterBufferMinutes: serviceData.afterBufferMinutes,
      color: serviceData.color,
      requiresConsultation: serviceData.requiresConsultation ?? false,
      requiresPatchTest: serviceData.requiresPatchTest ?? false,
      isActive: serviceData.isActive ?? true,
      ...(uniqueEmployees.length > 0 && {
        employeeServices: {
          create: uniqueEmployees.map(empId => ({ employeeId: empId }))
        }
      }),
      ...(uniqueBranches.length > 0 && {
        serviceBranches: {
          create: uniqueBranches.map(branch => ({ branchId: branch.branchId, price: branch.price }))
        }
      })
    });

    await this.auditLog(organizationId, ActionType.CREATE, service.id, actorUserId, { name: service.name });
    return service as unknown as ServiceResponseDto;
  }

  async updateService(organizationId: string, serviceId: string, actorUserId: string, data: UpdateServiceRequestDto): Promise<ServiceResponseDto> {
    const existing = await this.repo.findByIdWithDetails(serviceId, organizationId);
    if (!existing) throw new NotFoundError('Service not found');

    if (data.name !== undefined) {
      await this.validateDuplicateName(organizationId, data.name, serviceId);
    }
    if (data.serviceCategoryId !== undefined) {
      await this.validateCategory(organizationId, data.serviceCategoryId);
    }

    if (data.employees) {
      await this.validateEmployees(organizationId, data.employees);
      const uniqueEmployees = [...new Set(data.employees)];
      await this.repo.setEmployees(serviceId, uniqueEmployees);
      await this.auditLog(organizationId, ActionType.UPDATE, serviceId, actorUserId, { employees: uniqueEmployees, note: 'Employee Assignment Changes' });
    }

    if (data.branches) {
      await this.validateBranches(organizationId, data.branches);
      const uniqueBranches = Object.values(data.branches.reduce((acc, current) => {
        acc[current.branchId] = current;
        return acc;
      }, {} as Record<string, { branchId: string; price: number }>));
      await this.repo.setBranches(serviceId, uniqueBranches);
      await this.auditLog(organizationId, ActionType.UPDATE, serviceId, actorUserId, { branches: uniqueBranches, note: 'Branch Assignment Changes' });
    }

    const { employees, branches, ...updateData } = data;

    const service = await this.repo.update(serviceId, {
      ...(updateData.serviceCategoryId && { serviceCategory: { connect: { id: updateData.serviceCategoryId } } }),
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.pricingType && { pricingType: updateData.pricingType }),
      ...(updateData.basePrice !== undefined && { basePrice: updateData.basePrice }),
      ...(updateData.durationMinutes !== undefined && { durationMinutes: updateData.durationMinutes }),
      ...(updateData.processingMinutes !== undefined && { processingMinutes: updateData.processingMinutes }),
      ...(updateData.cleanupMinutes !== undefined && { cleanupMinutes: updateData.cleanupMinutes }),
      ...(updateData.beforeBufferMinutes !== undefined && { beforeBufferMinutes: updateData.beforeBufferMinutes }),
      ...(updateData.afterBufferMinutes !== undefined && { afterBufferMinutes: updateData.afterBufferMinutes }),
      ...(updateData.color !== undefined && { color: updateData.color }),
      ...(updateData.requiresConsultation !== undefined && { requiresConsultation: updateData.requiresConsultation }),
      ...(updateData.requiresPatchTest !== undefined && { requiresPatchTest: updateData.requiresPatchTest }),
      ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
    });

    await this.auditLog(organizationId, ActionType.UPDATE, service.id, actorUserId, updateData);
    return service as unknown as ServiceResponseDto;
  }

  private async checkServiceDependencies(serviceId: string) {
    // For future: Check active appointments, packages, memberships, promotions, etc.
    return true; 
  }

  async deactivateService(organizationId: string, serviceId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithDetails(serviceId, organizationId);
    if (!existing) throw new NotFoundError('Service not found');

    await this.checkServiceDependencies(serviceId);
    
    await this.repo.update(serviceId, { isActive: false });
    await this.auditLog(organizationId, ActionType.UPDATE, serviceId, actorUserId, { isActive: false });
  }

  async activateService(organizationId: string, serviceId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithDetails(serviceId, organizationId);
    if (!existing) throw new NotFoundError('Service not found');

    await this.repo.update(serviceId, { isActive: true });
    await this.auditLog(organizationId, ActionType.UPDATE, serviceId, actorUserId, { isActive: true });
  }

  async deleteService(organizationId: string, serviceId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithDetails(serviceId, organizationId);
    if (!existing) throw new NotFoundError('Service not found');

    await this.checkServiceDependencies(serviceId);

    await this.repo.softDelete(serviceId);
    await this.auditLog(organizationId, ActionType.DELETE, serviceId, actorUserId, { reason: 'Soft Delete' });
  }
}
