import { NextResponse } from 'next/server';
import { prisma } from '@anex/database';

export async function POST(req: Request) {
  try {
    const { subscription, customerId } = await req.json();

    if (!subscription || !customerId) {
      return NextResponse.json({ error: 'Missing subscription or customerId' }, { status: 400 });
    }

    const pushToken = JSON.stringify(subscription);

    const existingDevice = await prisma.customerDevice.findFirst({
      where: { customerId },
    });

    if (existingDevice) {
      await prisma.customerDevice.update({
        where: { deviceId: existingDevice.deviceId },
        data: { pushToken },
      });
    } else {
      await prisma.customerDevice.create({
        data: {
          customerId,
          deviceId: crypto.randomUUID(),
          tokenHash: 'dummy_hash',
          pushToken,
          platform: 'web',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

