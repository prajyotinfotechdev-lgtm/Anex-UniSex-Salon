require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Latest Customers:");
  console.log(customers);

  const appointments = await prisma.appointment.findMany({
    select: { id: true, customerId: true, status: true, date: true, customer: { select: { firstName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("\nLatest Appointments:");
  console.log(appointments);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
