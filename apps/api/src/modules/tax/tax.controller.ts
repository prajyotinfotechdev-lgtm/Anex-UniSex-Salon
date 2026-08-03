import { Request, Response } from 'express';
import { taxService } from './tax.service';
import { CreateTaxCategoryDto, UpdateTaxCategoryDto } from './tax.dto';

export class TaxController {
  getCategories = async (req: Request, res: Response) => {
    const data = await taxService.getTaxCategories();
    res.json({ success: true, data });
  };

  getCategory = async (req: Request, res: Response) => {
    const data = await taxService.getTaxCategory(req.params.id);
    res.json({ success: true, data });
  };

  createCategory = async (req: Request, res: Response) => {
    const dto = req.body;
    const data = await taxService.createTaxCategory(dto);
    res.status(201).json({ success: true, data });
  };

  updateCategory = async (req: Request, res: Response) => {
    const dto = req.body;
    const data = await taxService.updateTaxCategory(req.params.id, dto);
    res.json({ success: true, data });
  };

  deleteCategory = async (req: Request, res: Response) => {
    const result = await taxService.deleteTaxCategory(req.params.id);
    res.json({ success: true, message: 'Tax category deleted successfully' });
  };
}

export const taxController = new TaxController();
