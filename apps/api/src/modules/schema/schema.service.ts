import { Prisma } from '@anex/database';
import { NotFoundError } from '../../errors/AppErrors';

export interface FieldMetadata {
  name: string;
  type: string;
  isRequired: boolean;
  isList: boolean;
  isId: boolean;
  isUnique: boolean;
  hasDefaultValue: boolean;
  kind: 'scalar' | 'object' | 'enum' | 'unsupported';
  enumValues?: string[];
}

export interface ModelMetadata {
  name: string;
  fields: FieldMetadata[];
}

export class SchemaService {
  /**
   * Retrieves the dynamic schema metadata for a given Prisma model name.
   */
  static getModelMetadata(modelName: string): ModelMetadata {
    const models = Prisma.dmmf.datamodel.models;
    const enums = Prisma.dmmf.datamodel.enums;
    
    const model = models.find((m) => m.name === modelName);
    
    if (!model) {
      throw new NotFoundError(`Model ${modelName} not found in database schema`);
    }

    const fields: FieldMetadata[] = model.fields.map((f) => {
      let enumValues: string[] | undefined = undefined;
      
      if (f.kind === 'enum') {
        const enumData = enums.find(e => e.name === f.type);
        if (enumData) {
          enumValues = enumData.values.map(v => v.name);
        }
      }

      return {
        name: f.name,
        type: f.type,
        isRequired: f.isRequired,
        isList: f.isList,
        isId: f.isId,
        isUnique: f.isUnique,
        hasDefaultValue: f.hasDefaultValue,
        kind: f.kind,
        enumValues,
      };
    });

    return {
      name: model.name,
      fields,
    };
  }
}
