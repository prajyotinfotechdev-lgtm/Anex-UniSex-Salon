import { PrismaClient } from '@prisma/client';

export const seedServiceCategories = async (prisma: PrismaClient, organizationId: string) => {
  console.log('Seeding service categories...');

  const defaultCategories = [
    { name: 'Haircuts', description: 'All types of haircuts and trims' },
    { name: 'Coloring', description: 'Hair coloring, highlights, and bleaching' },
    { name: 'Styling', description: 'Blowouts, updos, and special event styling' },
    { name: 'Treatments', description: 'Deep conditioning, keratin, and scalp treatments' },
    { name: 'Extensions', description: 'Hair extensions and maintenance' },
    { name: 'Nails', description: 'Manicures and pedicures' },
    { name: 'Spa', description: 'Massages, facials, and waxing' },
  ];

  for (const category of defaultCategories) {
    const existing = await prisma.serviceCategory.findFirst({
      where: {
        organizationId,
        name: category.name,
      },
    });

    if (!existing) {
      await prisma.serviceCategory.create({
        data: {
          organizationId,
          name: category.name,
          description: category.description,
          isActive: true,
        },
      });
    }
  }
};
