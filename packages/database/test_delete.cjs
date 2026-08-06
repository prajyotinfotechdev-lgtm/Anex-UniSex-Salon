require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const customer = await prisma.customer.findFirst({
        where: { firstName: 'Testing' }
    });
    
    if (!customer) {
      console.log('No testing customer found');
      const c2 = await prisma.customer.findFirst();
      if (!c2) return console.log('no customers at all');
      console.log('Trying with ', c2.id);
      return runDelete(c2.id);
    }
    await runDelete(customer.id);
  } catch (err) {
    console.error('Outer Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

async function runDelete(customerId) {
    console.log('Attempting to delete customer:', customerId);
    try {
        await prisma.$transaction(async (tx) => {
        // 1. Unlink optional relations
        await tx.appointment.updateMany({ where: { customerId }, data: { customerId: null } });
        await tx.appointmentHistory.updateMany({ where: { customerId }, data: { customerId: null } });
        await tx.invoice.updateMany({ where: { customerId }, data: { customerId: null } });
        
        // 2. Delete direct relations
        await tx.customerTag.deleteMany({ where: { customerId } });
        await tx.customerPhone.deleteMany({ where: { customerId } });
        await tx.customerMedia.deleteMany({ where: { customerId } });
        await tx.loyaltyTransaction.deleteMany({ where: { customerId } });
        await tx.walletTransaction.deleteMany({ where: { customerId } });
        await tx.customerMembership.deleteMany({ where: { customerId } });
        await tx.customerPackage.deleteMany({ where: { customerId } });
        await tx.inspirationBookmark.deleteMany({ where: { customerId } });

        const forms = await tx.consultationForm.findMany({ where: { customerId }, select: { id: true } });
        const formIds = forms.map(f => f.id);
        if (formIds.length > 0) {
            await tx.consultationAnswer.deleteMany({ where: { consultationFormId: { in: formIds } } });
            await tx.consultationForm.deleteMany({ where: { customerId } });
        }

        await tx.customer.delete({ where: { id: customerId } });
        });
        console.log('Success!');
    } catch(err) {
        console.error('Delete error', err);
    }
}
run();
