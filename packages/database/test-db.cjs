const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.customer.findFirst().then(console.log).catch(console.error).finally(() => db.$disconnect());
