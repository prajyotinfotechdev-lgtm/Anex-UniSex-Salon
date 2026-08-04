import { z } from 'zod';

const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

const updateCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim().optional(),
    lastName: z.string().min(1, 'Last name is required').trim().optional(),
    email: z.literal('').or(z.string().email('Invalid email format').trim().toLowerCase()).optional().nullable().transform(e => e === '' ? null : e),
    primaryPhone: z.string().min(1, 'Primary phone is required').trim().transform(val => val.replace(/\s+/g, '')).optional(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    dob: z.literal('').or(z.string().datetime({ message: 'Must be a valid ISO 8601 date string' })).optional().nullable().transform(e => e === '' ? null : e),
    addressLine1: z.string().trim().optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zipCode: z.string().trim().optional(),
    country: z.string().trim().optional(),
    notes: z.string().trim().optional().nullable(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string().uuid('Invalid tag ID format')).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
});

const payloads = [
  { body: { firstName: "A", lastName: "B", primaryPhone: "123", email: "", dob: "" }, params: { id: "c2ef6601-0044-4f61-ac54-9ee5a5359beb" } },
  { body: { firstName: "A", lastName: "B", primaryPhone: "123", email: null, dob: null }, params: { id: "c2ef6601-0044-4f61-ac54-9ee5a5359beb" } },
  { body: { firstName: "A", lastName: "B", primaryPhone: "123" }, params: { id: "c2ef6601-0044-4f61-ac54-9ee5a5359beb" } },
  { body: { firstName: "A", lastName: "B", primaryPhone: "123", tags: [undefined] }, params: { id: "c2ef6601-0044-4f61-ac54-9ee5a5359beb" } },
  { body: { firstName: "A", lastName: "B", primaryPhone: "123", tags: ["invalid-uuid"] }, params: { id: "c2ef6601-0044-4f61-ac54-9ee5a5359beb" } },
];

for (const payload of payloads) {
  const result = updateCustomerSchema.safeParse(payload);
  console.log("Payload:", JSON.stringify(payload.body));
  if (!result.success) {
    console.log("  Errors:", result.error.errors.map(e => e.message).join(', '));
  } else {
    console.log("  Success!");
  }
}
