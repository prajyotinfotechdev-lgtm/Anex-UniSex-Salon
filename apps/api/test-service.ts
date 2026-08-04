require('dotenv').config({ path: '../../.env' });
const { CustomerService } = require('./src/modules/customer/customer.service.ts');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  const customerService = new CustomerService();
  try {
    const customer = await db.customer.findFirst();
    if (!customer) return console.log('No customer');
    
    console.log('Updating customer', customer.id);
    const result = await customerService.updateCustomer(
      customer.organizationId,
      customer.id,
      customer.id, // using customer ID as actor ID just for testing
      {
        firstName: "Test",
        lastName: "User",
        email: "",
        primaryPhone: customer.primaryPhone,
        dob: ""
      }
    );
    console.log('Update successful:', result.id);
  } catch (e) {
    console.error('Update failed:', e);
  } finally {
    await db.$disconnect();
  }
}

run();
