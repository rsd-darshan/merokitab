import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'buy' // 'buy' or 'sell'

    const where: any = type === 'buy' 
      ? { buyerId: session.id }
      : { sellerId: session.id }

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    // Auto-create chat threads for orders that should have them but don't
    for (const order of orders) {
      if (
        !order.chatThread &&
        (order.status === 'PAYMENT_VERIFICATION_PENDING' ||
         order.status === 'PAYMENT_CONFIRMED' ||
         order.status === 'COMPLETED')
      ) {
        try {
          await prisma.chatThread.create({
            data: {
              orderId: order.id,
              buyerId: order.buyerId,
              sellerId: order.sellerId,
            },
          })
          // Reload the order with the new thread
          const updatedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
              book: true,
              chatThread: { select: { id: true } },
              buyer: {
                select: { id: true, name: true, email: true, phone: true },
              },
              seller: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          })
          if (updatedOrder) {
            const index = orders.findIndex((o) => o.id === order.id)
            if (index !== -1) orders[index] = updatedOrder
          }
        } catch (error) {
          // Thread might already exist, ignore
          console.error('Error creating chat thread:', error)
        }
      }
    }

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookId } = await request.json()

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 })
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    if (book.status === 'SOLD') {
      return NextResponse.json({ error: 'Book already sold' }, { status: 400 })
    }

    if (book.sellerId === session.id) {
      return NextResponse.json({ error: 'Cannot buy your own book' }, { status: 400 })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        bookId,
        buyerId: session.id,
        sellerId: book.sellerId,
        sellerPrice: book.sellerPrice,
        platformPrice: book.platformPrice,
        status: 'PENDING_PAYMENT',
      },
      include: {
        book: true,
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

    // Mark book as sold
    await prisma.book.update({
      where: { id: bookId },
      data: { status: 'SOLD' },
    })

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
