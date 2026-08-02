import { PrismaClient, NotificationType } from '@prisma/client';

export const seedNotificationTemplates = async (prisma: PrismaClient, organizationId: string) => {
  console.log('Seeding notification templates...');

  const defaultTemplates = [
    {
      name: 'Appointment Confirmation',
      type: NotificationType.EMAIL,
      subject: 'Your Appointment Confirmation',
      body: 'Dear {{customerName}}, your appointment for {{serviceName}} is confirmed for {{appointmentDate}}.',
      variables: ['customerName', 'serviceName', 'appointmentDate'],
    },
    {
      name: 'Appointment Reminder SMS',
      type: NotificationType.SMS,
      subject: null,
      body: 'Reminder: You have an appointment for {{serviceName}} at {{appointmentTime}}.',
      variables: ['serviceName', 'appointmentTime'],
    },
  ];

  for (const template of defaultTemplates) {
    const existing = await prisma.notificationTemplate.findFirst({
      where: {
        organizationId,
        name: template.name,
      },
    });

    if (!existing) {
      await prisma.notificationTemplate.create({
        data: {
          organizationId,
          name: template.name,
          type: template.type,
          subject: template.subject,
          body: template.body,
          variables: JSON.stringify(template.variables),
        },
      });
    }
  }
};
