import { z } from 'zod';
import { baseReportFilterSchema } from './reports.validator';

export type BaseReportFilterQueryDto = z.infer<typeof baseReportFilterSchema>['query'];
