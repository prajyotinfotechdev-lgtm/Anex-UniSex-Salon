import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const appts = await prisma.appointment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      items: true
    }
  });
  console.log(JSON.stringify(appts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
