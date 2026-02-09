import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        book: true,
        chatThread: {
          select: { id: true },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only buyer, seller, or admin can view
    if (order.buyerId !== session.id && order.sellerId !== session.id && !session.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { action } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (action === 'mark_paid') {
      // Buyer marks as paid - automatically confirm payment
      if (order.buyerId !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (order.status !== 'PENDING_PAYMENT') {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
      }

      // Update order to PAYMENT_CONFIRMED immediately
      // Create chat thread first
      const thread = await prisma.chatThread.upsert({
        where: { orderId: id },
        update: {},
        create: {
          orderId: id,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
        },
      })

      // Update order to PAYMENT_CONFIRMED immediately
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paymentMarkedAt: new Date(),
          paymentConfirmedAt: new Date(),
        },
        include: {
          book: true,
          chatThread: {
            select: { id: true },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      })

      return NextResponse.json({ order: updated })
    }

    if (action === 'confirm_payment') {
      // Admin confirms payment
      if (!session.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (order.status !== 'PAYMENT_VERIFICATION_PENDING') {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paymentConfirmedAt: new Date(),
        },
      })

      // Ensure a chat thread exists once payment is confirmed
      await prisma.chatThread.upsert({
        where: { orderId: id },
        update: {},
        create: {
          orderId: id,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
        },
      })

      return NextResponse.json({ order: updated })
    }

    if (action === 'mark_payout_sent') {
      // Admin marks payout as sent
      if (!session.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (order.status !== 'PAYMENT_CONFIRMED') {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          payoutSentAt: new Date(),
        },
      })

      return NextResponse.json({ order: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
