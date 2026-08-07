import { NextResponse } from 'next/server';
import { prisma } from '@anex/database';

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    // Set pushToken to null for the given customer device
    await prisma.customerDevice.updateMany({
      where: { customerId },
      data: { pushToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
