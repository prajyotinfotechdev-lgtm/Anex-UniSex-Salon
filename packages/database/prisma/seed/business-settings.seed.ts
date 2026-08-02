import { PrismaClient } from '@prisma/client';

export const seedBusinessSettings = async (prisma: PrismaClient, organizationId: string) => {
  console.log('Seeding business settings...');

  const defaultSettings = [
    { key: 'currency', value: 'USD' },
    { key: 'timezone', value: 'UTC' },
    { key: 'date_format', value: 'YYYY-MM-DD' },
    { key: 'time_format', value: '24h' },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.businessSetting.findUnique({
      where: {
        organizationId_key: {
          organizationId,
          key: setting.key,
        },
      },
    });

    if (!existing) {
      await prisma.businessSetting.create({
        data: {
          organizationId,
          key: setting.key,
          value: JSON.stringify(setting.value),
        },
      });
    }
  }
};
