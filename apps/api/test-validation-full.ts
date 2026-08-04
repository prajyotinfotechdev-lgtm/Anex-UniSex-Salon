import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { updateCustomerSchema } from './src/modules/customer/customer.validator.js';

const payload = {
  firstName: 'Test',
  lastName: 'User',
  email: '',
  primaryPhone: '+1 555-0123',
  gender: undefined,
  dob: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  notes: '',
  isActive: true,
  tags: [],
};

async function run() {
  try {
    const result = await updateCustomerSchema.parseAsync({ body: payload, params: { id: "test" }, query: {} });
    console.log("Validation successful:", result);
  } catch (e) {
    console.error("Validation failed:", e);
  }
}
run();
