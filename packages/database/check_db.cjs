const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const devices = await prisma.customerDevice.findMany();
    console.log('Total devices:', devices.length);
    console.log('Devices with pushToken:', devices.filter(x => x.pushToken !== null && x.pushToken !== '').length);
    console.log('All devices:', JSON.stringify(devices, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
