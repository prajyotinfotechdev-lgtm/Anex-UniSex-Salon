import { BillingRepository } from './apps/api/src/modules/billing/billing.repository';
import { prisma } from './apps/api/src/database/prisma.client';

async function test() {
  const repo = new BillingRepository();
  const org = await prisma.organization.findFirst();
  if (!org) return console.log('No org');
  
  const res = await repo.listInvoices(org.id, {});
  console.log('Invoices count:', res.meta.total);
  if (res.meta.total === 0) {
     const all = await prisma.invoice.findMany({});
     console.log('Total invoices in DB:', all.length);
     console.log('First invoice:', all[0]);
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
