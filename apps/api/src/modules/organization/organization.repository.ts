import { Prisma, Organization, Branch, CalendarException } from '@prisma/client';
import { BaseRepository } from '../../repositories/BaseRepository';

export class OrganizationRepository extends BaseRepository<Organization, Prisma.OrganizationCreateInput, Prisma.OrganizationUpdateInput> {
  async findById(id: string): Promise<Organization | null> {
    return this.db.organization.findUnique({ where: { id } });
  }

  async findMany(params: Prisma.OrganizationFindManyArgs): Promise<Organization[]> {
    return this.db.organization.findMany(params);
  }

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return this.db.organization.create({ data });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return this.db.organization.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Organization> {
    return this.db.organization.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<Organization> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }
}

export class BranchRepository extends BaseRepository<Branch, Prisma.BranchCreateInput, Prisma.BranchUpdateInput> {
  async findById(id: string): Promise<Branch | null> {
    return this.db.branch.findUnique({ where: { id } });
  }

  async findMany(params: Prisma.BranchFindManyArgs): Promise<Branch[]> {
    return this.db.branch.findMany(params);
  }

  async create(data: Prisma.BranchCreateInput): Promise<Branch> {
    return this.db.branch.create({ data });
  }

  async update(id: string, data: Prisma.BranchUpdateInput): Promise<Branch> {
    return this.db.branch.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Branch> {
    return this.db.branch.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<Branch> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }
}

export class HolidayRepository extends BaseRepository<CalendarException, Prisma.CalendarExceptionCreateInput, Prisma.CalendarExceptionUpdateInput> {
  async findById(id: string): Promise<CalendarException | null> {
    return this.db.calendarException.findUnique({ where: { id } });
  }

  async findMany(params: Prisma.CalendarExceptionFindManyArgs): Promise<CalendarException[]> {
    return this.db.calendarException.findMany(params);
  }

  async create(data: Prisma.CalendarExceptionCreateInput): Promise<CalendarException> {
    return this.db.calendarException.create({ data });
  }

  async update(id: string, data: Prisma.CalendarExceptionUpdateInput): Promise<CalendarException> {
    return this.db.calendarException.update({ where: { id }, data });
  }

  async delete(id: string): Promise<CalendarException> {
    return this.db.calendarException.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<CalendarException> {
    // CalendarException doesn't have deletedAt or isActive, so we actually delete it.
    return this.delete(id);
  }
}
