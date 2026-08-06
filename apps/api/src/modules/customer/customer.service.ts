import { BaseService } from '../../services/BaseService';
import { CustomerRepository } from './customer.repository';
import { prisma } from '../../database/prisma.client';
import { AuditService } from '../../services/AuditService';
import { ActionType } from '@anex/database';
import { NotFoundError, ConflictError, ValidationError } from '../../errors/AppErrors';
import {
  CreateCustomerRequestDto,
  UpdateCustomerRequestDto,
  SearchCustomersQueryDto,
  CustomerResponseDto,
} from './customer.dto';

export class CustomerService extends BaseService {
  private repo: CustomerRepository;

  constructor() {
    super();
    this.repo = new CustomerRepository();
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
        entityName: 'Customer',
        entityId,
        userId,
        newValue: details,
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  private async validateUniqueConstraints(organizationId: string, phone: string, email?: string | null, excludeCustomerId?: string) {
    const existingPhone = await this.repo.findByPhone(phone, organizationId);
    if (existingPhone && existingPhone.id !== excludeCustomerId) {
      throw new ConflictError('Primary phone is already registered to another customer');
    }

    if (email) {
      const existingEmail = await this.repo.findByEmail(email, organizationId);
      if (existingEmail && existingEmail.id !== excludeCustomerId) {
        throw new ConflictError('Email is already registered to another customer');
      }
    }
  }

  private async validateTags(organizationId: string, tagIds?: string[]) {
    if (!tagIds || tagIds.length === 0) return;

    const uniqueTagIds = [...new Set(tagIds)];
    const validTags = await this.repo.checkTagsExist(uniqueTagIds, organizationId);

    if (validTags.length !== uniqueTagIds.length) {
      throw new ValidationError('One or more tags do not exist or do not belong to this organization');
    }
  }

  async searchCustomers(organizationId: string, params: SearchCustomersQueryDto) {
    return this.repo.search(organizationId, params);
  }

  async getCustomerById(organizationId: string, customerId: string): Promise<CustomerResponseDto> {
    const customer = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!customer) throw new NotFoundError('Customer not found');
    return customer as unknown as CustomerResponseDto;
  }

  async createCustomer(organizationId: string, actorUserId: string, data: CreateCustomerRequestDto): Promise<CustomerResponseDto> {
    await this.validateUniqueConstraints(organizationId, data.primaryPhone, data.email);
    
    if (data.tags) {
      await this.validateTags(organizationId, data.tags);
    }

    const { tags, ...customerData } = data;
    const uniqueTags = tags ? [...new Set(tags)] : [];

    const customer = await this.repo.create({
      organization: { connect: { id: organizationId } },
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      primaryPhone: customerData.primaryPhone,
      gender: customerData.gender,
      dob: customerData.dob ? new Date(customerData.dob) : null,
      addressLine1: customerData.addressLine1,
      addressLine2: customerData.addressLine2,
      city: customerData.city,
      state: customerData.state,
      zipCode: customerData.zipCode,
      country: customerData.country,
      notes: customerData.notes,
      isActive: customerData.isActive ?? true,
      ...(uniqueTags.length > 0 && {
        tags: {
          create: uniqueTags.map(tagId => ({
            tagId
          }))
        }
      })
    });

    await this.auditLog(organizationId, ActionType.CREATE, customer.id, actorUserId, { phone: customer.primaryPhone, email: customer.email });
    return customer as unknown as CustomerResponseDto;
  }

  async updateCustomer(organizationId: string, customerId: string, actorUserId: string, data: UpdateCustomerRequestDto): Promise<CustomerResponseDto> {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    const phoneToCheck = data.primaryPhone ?? existing.primaryPhone;
    const emailToCheck = data.email !== undefined ? data.email : existing.email;

    await this.validateUniqueConstraints(organizationId, phoneToCheck, emailToCheck, customerId);
    
    if (data.tags) {
      await this.validateTags(organizationId, data.tags);
      const uniqueTags = [...new Set(data.tags)];
      await this.repo.setTags(customerId, uniqueTags);
      await this.auditLog(organizationId, ActionType.UPDATE, customerId, actorUserId, { tags: uniqueTags, note: 'Customer Tag Changes' });
    }

    const { tags, ...updateData } = data;

    const customer = await this.repo.update(customerId, {
      ...(updateData.firstName && { firstName: updateData.firstName }),
      ...(updateData.lastName && { lastName: updateData.lastName }),
      ...(updateData.email !== undefined && { email: updateData.email }),
      ...(updateData.primaryPhone && { primaryPhone: updateData.primaryPhone }),
      ...(updateData.gender !== undefined && { gender: updateData.gender }),
      ...(updateData.dob !== undefined && { dob: updateData.dob ? new Date(updateData.dob) : null }),
      ...(updateData.addressLine1 !== undefined && { addressLine1: updateData.addressLine1 }),
      ...(updateData.addressLine2 !== undefined && { addressLine2: updateData.addressLine2 }),
      ...(updateData.city !== undefined && { city: updateData.city }),
      ...(updateData.state !== undefined && { state: updateData.state }),
      ...(updateData.zipCode !== undefined && { zipCode: updateData.zipCode }),
      ...(updateData.country !== undefined && { country: updateData.country }),
      ...(updateData.notes !== undefined && { notes: updateData.notes }),
      ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
    });

    await this.auditLog(organizationId, ActionType.UPDATE, customer.id, actorUserId, updateData);
    return customer as unknown as CustomerResponseDto;
  }

  private async checkCustomerDependencies(customerId: string) {
    // For future: Check active appointments, wallet balance, outstanding invoices, etc.
    // If dependencies exist, throw new ConflictError('Cannot deactivate customer with active dependencies');
    return true; 
  }

  async deactivateCustomer(organizationId: string, customerId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    await this.checkCustomerDependencies(customerId);
    
    await this.repo.update(customerId, { isActive: false });
    await this.auditLog(organizationId, ActionType.UPDATE, customerId, actorUserId, { isActive: false });
  }

  async activateCustomer(organizationId: string, customerId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    await this.repo.update(customerId, { isActive: true });
    await this.auditLog(organizationId, ActionType.UPDATE, customerId, actorUserId, { isActive: true });
  }

  async deleteCustomer(organizationId: string, customerId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    await this.checkCustomerDependencies(customerId);

    await this.repo.softDelete(customerId);
    await this.auditLog(organizationId, ActionType.DELETE, customerId, actorUserId, { reason: 'Soft Delete' });
  }

  async hardDeleteCustomer(organizationId: string, customerId: string, actorUserId: string): Promise<void> {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    await prisma.$transaction(async (tx) => {
      // 1. Unlink optional relations (Appointments and Invoices)
      await tx.appointment.updateMany({
        where: { customerId },
        data: { customerId: null }
      });
      await tx.appointmentHistory.updateMany({
        where: { customerId },
        data: { customerId: null }
      });
      await tx.invoice.updateMany({
        where: { customerId },
        data: { customerId: null }
      });

      // 2. Delete direct relations that don't cascade automatically
      await tx.customerTag.deleteMany({ where: { customerId } });
      await tx.customerPhone.deleteMany({ where: { customerId } });
      await tx.customerMedia.deleteMany({ where: { customerId } });
      await tx.loyaltyTransaction.deleteMany({ where: { customerId } });
      await tx.walletTransaction.deleteMany({ where: { customerId } });
      await tx.customerMembership.deleteMany({ where: { customerId } });
      await tx.customerPackage.deleteMany({ where: { customerId } });
      await tx.inspirationBookmark.deleteMany({ where: { customerId } });
      // Note: CustomerDevice and ConsultationRecord have onDelete: Cascade in schema

      // 3. Consultation form and answers
      const forms = await tx.consultationForm.findMany({ where: { customerId }, select: { id: true } });
      const formIds = forms.map(f => f.id);
      if (formIds.length > 0) {
        await tx.consultationAnswer.deleteMany({ where: { consultationFormId: { in: formIds } } });
        await tx.consultationForm.deleteMany({ where: { customerId } });
      }

      // 4. Finally, delete the customer record
      await tx.customer.delete({ where: { id: customerId } });
    });

    await this.auditLog(organizationId, ActionType.DELETE, customerId, actorUserId, { reason: 'Permanent Hard Delete' });
  }

  async getCustomerDevices(organizationId: string, customerId: string) {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    return prisma.customerDevice.findMany({
      where: { customerId },
      orderBy: { lastUsedAt: 'desc' }
    });
  }

  async revokeCustomerDevice(organizationId: string, customerId: string, deviceId: string) {
    const existing = await this.repo.findByIdWithHistory(customerId, organizationId);
    if (!existing) throw new NotFoundError('Customer not found');

    await prisma.customerDevice.updateMany({
      where: { customerId, id: deviceId }, // Assuming we pass the db ID as deviceId here
      data: { isRevoked: true }
    });
  }
}
