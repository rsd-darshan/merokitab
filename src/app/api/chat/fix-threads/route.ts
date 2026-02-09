import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Admin-only endpoint to create missing chat threads for existing orders
export async function POST() {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find orders that should have chat threads but don't
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PAYMENT_VERIFICATION_PENDING', 'PAYMENT_CONFIRMED', 'COMPLETED'],
        },
        chatThread: null,
      },
    })

    let created = 0
    for (const order of orders) {
      await prisma.chatThread.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          orderId: order.id,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
        },
      })
      created++
    }

    return NextResponse.json({ 
      success: true, 
      message: `Created ${created} chat thread(s) for existing orders` 
    })
  } catch (error) {
    console.error('Fix threads error:', error)
    return NextResponse.json({ error: 'Failed to fix threads' }, { status: 500 })
  }
}
