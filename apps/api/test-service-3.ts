import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { CustomerService } from './src/modules/customer/customer.service.js';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function run() {
  const customerService = new CustomerService();
  try {
    const customer = await db.customer.findFirst({
      include: { tags: true }
    });
    if (!customer) return console.log('No customer');
    
    console.log('Updating customer', customer.id);
    
    // Simulate what the frontend sends
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
      tags: customer.tags?.map(t => t.id) || [], // Note: t.id is the CustomerTag UUID!
    };

    const result = await customerService.updateCustomer(
      customer.organizationId,
      customer.id,
      customer.id,
      payload
    );
    console.log('Update successful:', result.id);
  } catch (e) {
    console.error('Update failed:', e);
  } finally {
    await db.$disconnect();
  }
}

run();
