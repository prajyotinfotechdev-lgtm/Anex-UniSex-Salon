import { PrismaClient } from '@prisma/client';

export const seedTaxCategories = async (prisma: PrismaClient, organizationId: string) => {
  console.log('Seeding tax categories...');

  const defaultCategories = [
    { name: 'Standard Rate', rate: 10.00 },
    { name: 'Reduced Rate', rate: 5.00 },
    { name: 'Zero Rate', rate: 0.00 },
  ];

  for (const category of defaultCategories) {
    const existing = await prisma.taxCategory.findFirst({
      where: {
        organizationId,
        name: category.name,
      },
    });

    if (!existing) {
      await prisma.taxCategory.create({
        data: {
          organizationId,
          name: category.name,
          taxRates: {
            create: {
              name: category.name,
              rate: category.rate,
              type: 'PERCENTAGE',
            }
          }
        },
      });
    }
  }
};
