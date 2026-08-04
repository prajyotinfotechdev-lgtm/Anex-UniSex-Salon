import { PrismaClient } from '@prisma/client';
import { CustomerService } from './src/modules/customer/customer.service.js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const db = new PrismaClient();

async function run() {
  try {
    const customerService = new CustomerService();
    const customer = await db.customer.findFirst({ include: { tags: true } });
    if (!customer) return console.log('No customer found');

    console.log('Testing full update payload exactly as frontend sends it...');
    const payload = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      primaryPhone: customer.primaryPhone,
      gender: customer.gender || undefined,
      dob: customer.dob ? customer.dob.toISOString() : '',
      addressLine1: customer.addressLine1 || '',
      addressLine2: customer.addressLine2 || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      country: customer.country || '',
      notes: customer.notes || '',
      isActive: customer.isActive,
      tags: customer.tags?.map(t => t.tagId) || [],
    };

    const res = await customerService.updateCustomer(customer.organizationId, customer.id, customer.id, payload);
    console.log('Update successful, ID:', res.id);
  } catch (err) {
    console.error('Update failed with error:', err);
  } finally {
    await db.$disconnect();
  }
}
run();
