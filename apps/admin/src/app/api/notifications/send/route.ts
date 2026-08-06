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
    } else {
      console.warn("VAPID keys missing. Push notification cannot be sent securely.");
      return NextResponse.json({ error: 'VAPID keys missing in configuration.' }, { status: 500 });
    }

    const { title, body, url, target, customerIds } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });
    }

    // Get all valid subscriptions
    let devices = [];
    
    if (target === 'all') {
      devices = await prisma.customerDevice.findMany({
        where: { pushToken: { not: null } },
      });
    } else if (target === 'specific' && Array.isArray(customerIds)) {
      devices = await prisma.customerDevice.findMany({
        where: { 
          customerId: { in: customerIds },
          pushToken: { not: null }
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid target or missing customerIds' }, { status: 400 });
    }

    if (devices.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscribed devices found.' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
    });

    let sentCount = 0;
    let failedCount = 0;

    // Send notifications in parallel
    const sendPromises = devices.map(async (device) => {
      try {
        if (!device.pushToken) return;
        const subscription = JSON.parse(device.pushToken);
        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send to device ${device.id}:`, err);
        failedCount++;
        // If subscription is invalid/expired (HTTP 410 or 404), remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.customerDevice.update({
            where: { id: device.id },
            data: { pushToken: null }
          });
        }
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({ 
      success: true, 
      sent: sentCount,
      failed: failedCount,
      message: `Successfully sent to ${sentCount} devices.`
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
