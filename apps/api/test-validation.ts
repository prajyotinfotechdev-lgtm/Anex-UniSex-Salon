import { z } from 'zod';
import { updateCustomerSchema } from './src/modules/customer/customer.validator.js';

const input = {
  firstName: "Prajyot",
  lastName: "Kankal",
  email: "",
  primaryPhone: "7020708747",
  gender: undefined,
  dob: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  notes: "",
  isActive: true,
  tags: []
};

try {
  const result = updateCustomerSchema.parse({ body: input });
  console.log("Validated successfully", result);
} catch (e) {
  console.error("Validation failed", e.errors);
}
