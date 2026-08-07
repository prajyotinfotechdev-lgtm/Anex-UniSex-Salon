import { NextResponse } from 'next/server';
import { prisma } from '@anex/database';
import webpush from 'web-push';

const DAILY_MESSAGES = [
  { title: "The Flirty Fix", body: "Are you a Wi-Fi router? Because we're feeling a connection... to your scalp. 🔌 Come get a relaxing head massage!" },
  { title: "The Stress Reliever", body: "Your boss stressed you out? Let us rub it out. 💆‍♂️ 30-min head massage slots open now!" },
  { title: "The Sassy Reality Check", body: "We can't solve all your life's problems, but our 30-min head massage comes pretty close. 😌" },
  { title: "The Direct Approach", body: "Your hair just texted us. It’s begging for a hot oil massage. 🧴 Don't leave it on read!" },
  { title: "The Cheeky Warning", body: "Warning: Our head massages might induce extreme happiness and sudden naps. Proceed with caution. 😴" },
  { title: "The Sweet Talker", body: "Stop overthinking. Let us massage that big, beautiful brain of yours! 🧠✨" },
  { title: "The Problem Solver", body: "You look tense. We have magic fingers. Let's make a deal. 🤝 Tap to book." }
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@anexsalon.com';
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublic || !vapidPrivate) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    // Pick a random message
    const randomMessage = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

    // Fetch all push subscriptions
    const devices = await prisma.customerDevice.findMany({
      where: {
        pushToken: { not: null }
      }
    });

    if (devices.length === 0) {
      return NextResponse.json({ success: true, message: 'No devices to notify' });
    }

    const payload = JSON.stringify({
      title: randomMessage.title,
      body: randomMessage.body,
      url: '/book',
      data: { url: '/book' }
    });

    let sent = 0;
    let failed = 0;

    // Send notifications in parallel
    await Promise.allSettled(
      devices.map(async (device: any) => {
        try {
          if (!device.pushToken) return;
          const subscription = JSON.parse(device.pushToken);
          await webpush.sendNotification(subscription, payload);
          sent++;
        } catch (error: any) {
          console.error(`Failed to send to device ${device.deviceId}:`, error);
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription expired or unsubscribed, remove it
            await prisma.customerDevice.update({
              where: { deviceId: device.deviceId },
              data: { pushToken: null }
            });
          }
          failed++;
        }
      })
    );

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error('Error sending daily marketing notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
