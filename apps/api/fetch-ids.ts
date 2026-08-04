import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const branch = await prisma.branch.findFirst();
  console.log('Branch ID:', branch?.id);
  const customer = await prisma.customer.findFirst();
  console.log('Customer ID:', customer?.id);
  const employee = await prisma.employee.findFirst();
  console.log('Employee ID:', employee?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
