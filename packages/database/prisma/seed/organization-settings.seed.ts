import { PrismaClient } from '@prisma/client';

export async function seedOrganizationSettings(prisma: PrismaClient, organizationId: string) {
  console.log('Seeding Organization Settings...');

  // 1. Core Modules
  const modules = [
    { key: 'APPOINTMENTS', name: 'Appointments', category: 'CORE', enabledByDefault: true },
    { key: 'INVENTORY', name: 'Inventory Management', category: 'OPERATIONS', enabledByDefault: false },
    { key: 'CRM', name: 'Customer Relationship Management', category: 'CUSTOMER', enabledByDefault: true },
    { key: 'MEMBERSHIPS', name: 'Memberships & Packages', category: 'SALES', enabledByDefault: false },
    { key: 'AI_INSIGHTS', name: 'AI Insights', category: 'ANALYTICS', enabledByDefault: false },
  ];

  for (const mod of modules) {
    const createdModule = await prisma.module.upsert({
      where: { key: mod.key },
      update: { name: mod.name, category: mod.category, enabledByDefault: mod.enabledByDefault },
      create: mod,
    });

    await prisma.organizationModule.upsert({
      where: { organizationId_moduleId: { organizationId, moduleId: createdModule.id } },
      update: {},
      create: {
        organizationId,
        moduleId: createdModule.id,
        enabled: createdModule.enabledByDefault,
        plan: 'BASIC'
      }
    });
  }

  // 2. Branding Configuration
  await prisma.brandingConfiguration.upsert({
    where: { organizationId },
    update: {},
    create: {
      organizationId,
      designTokens: {
        theme: 'light',
        primary: '#000000',
        secondary: '#FFFFFF',
        surface: '#F8F9FA',
        border: '#E9ECEF',
        radius: '8px'
      }
    }
  });

  // 3. Invoice Configuration
  await prisma.invoiceConfiguration.upsert({
    where: { organizationId },
    update: {},
    create: {
      organizationId,
      invoicePrefix: 'INV-',
      receiptPrefix: 'REC-',
      creditNotePrefix: 'CN-',
      numberFormat: '{prefix}{YYYY}{MM}{sequence}',
      financialYearReset: true,
      showQrCode: true,
      gstLayout: true,
      printTemplate: 'standard_a4'
    }
  });

  console.log('Organization Settings seeded.');
}
