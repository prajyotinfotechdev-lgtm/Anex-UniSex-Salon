import { RoleRepository } from './role.repository';

export class RoleService {
  private repo: RoleRepository;

  constructor() {
    this.repo = new RoleRepository();
  }

  async listRoles(organizationId: string, isActive?: boolean) {
    const roles = await this.repo.findMany({ organizationId, isActive });
    
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      type: role.type,
      isActive: role.isActive,
    }));
  }
}
