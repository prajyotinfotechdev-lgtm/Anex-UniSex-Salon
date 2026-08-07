import { NextResponse } from 'next/server';
import { prisma } from '@anex/database';
import webpush from 'web-push';

export async function POST(req: Request) {
  try {
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@anexsalon.com';
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    
    if (vapidPublic && vapidPrivate) {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    }

    const { customerId, title, body } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const device = await prisma.customerDevice.findFirst({
      where: { customerId },
    });

    if (!device || !device.pushToken) {
      return NextResponse.json({ error: 'No push subscription found for this customer' }, { status: 404 });
    }

    const subscription = JSON.parse(device.pushToken);
    
    const payload = JSON.stringify({
      title: title || 'Anex Salon Update',
      body: body || 'This is a test notification from Anex Salon.',
      url: '/',
      data: { url: '/' }
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
