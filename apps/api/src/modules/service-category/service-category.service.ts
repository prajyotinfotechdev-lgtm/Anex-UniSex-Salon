import { ServiceCategoryRepository, serviceCategoryRepository } from './service-category.repository';
import { SearchCategoriesQueryDto } from './service-category.dto';

export class ServiceCategoryService {
  constructor(private readonly repo: ServiceCategoryRepository = serviceCategoryRepository) {}

  async listCategories(organizationId: string, params: SearchCategoriesQueryDto) {
    return this.repo.listCategories(organizationId, params);
  }
}

export const serviceCategoryService = new ServiceCategoryService();
