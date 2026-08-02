import { Request, Response, NextFunction } from 'express';
import { serviceCategoryService } from './service-category.service';
import { successResponse } from '@anex/shared';
import { SearchCategoriesQueryDto } from './service-category.dto';

export const listServiceCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organizationId } = req.user!;
    const query = req.query as unknown as SearchCategoriesQueryDto;

    const { total, categories } = await serviceCategoryService.listCategories(
      organizationId,
      query
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(successResponse('Service categories retrieved successfully', {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    }));
  } catch (error) {
    next(error);
  }
};
