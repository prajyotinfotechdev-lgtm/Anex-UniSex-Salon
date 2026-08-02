import { z } from 'zod';
import { searchCategoriesSchema } from './service-category.validator';

export type SearchCategoriesQueryDto = z.infer<typeof searchCategoriesSchema>['query'];

export interface ServiceCategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}
