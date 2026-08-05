import { NextResponse } from 'next/server';
import { prisma } from '@anex/database';
import webpush from 'web-push';

const WEEKLY_MESSAGES = [
  { title: "The Ex-Factor", body: "Your ex called... they want you back. Don't worry, a fresh fade will remind them exactly what they lost. 😎" },
  { title: "The Confidence Booster", body: "Is it getting hot in here, or is it just your new haircut waiting to happen? 🔥" },
  { title: "The Beast Tamer", body: "That beard is looking a little wild, Tarzan. Let's tame the beast! 🦁 Book a trim." },
  { title: "The Upgrade", body: "We know you're already handsome, but let's take it from 'cute' to 'can't look away'. 💈" },
  { title: "The Truth Bomb", body: "A great beard doesn't happen by accident. It happens by appointment. 🧔" },
  { title: "The Sign", body: "Looking for a sign to finally change your hairstyle? This is it. 🛑 Tap here to get styled." },
  { title: "The Weekend Prep", body: "New week, new you. Or at least, a much better-looking version of you for the weekend. ✂️" }
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
    const randomMessage = WEEKLY_MESSAGES[Math.floor(Math.random() * WEEKLY_MESSAGES.length)];

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
      url: '/book'
    });

    let sent = 0;
    let failed = 0;

    // Send notifications in parallel
    await Promise.allSettled(
      devices.map(async (device) => {
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
    console.error('Error sending weekly marketing notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
