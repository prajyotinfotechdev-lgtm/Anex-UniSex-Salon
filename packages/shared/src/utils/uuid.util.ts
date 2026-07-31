import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export const generateUUID = (): string => {
  return uuidv4();
};

export const isValidUUID = (uuid: string): boolean => {
  return uuidValidate(uuid);
};
