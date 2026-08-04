import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function run() {
  const customer = await db.customer.findFirst({
    include: { tags: true }
  });
  console.log("Customer tags:", JSON.stringify(customer?.tags, null, 2));
}

run();
