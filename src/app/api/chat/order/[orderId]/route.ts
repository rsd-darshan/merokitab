import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await params

  const thread = await prisma.chatThread.findUnique({
    where: { orderId },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
      order: { select: { status: true } },
    },
  })

  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed = thread.buyerId === session.id || thread.sellerId === session.id || session.isAdmin
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ threadId: thread.id, status: thread.order.status })
}

