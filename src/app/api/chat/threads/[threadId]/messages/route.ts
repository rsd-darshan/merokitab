import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { publish } from '@/lib/chatBroker'
import { z } from 'zod'

const sendSchema = z.object({
  content: z.string().trim().min(1).max(1000),
})

function chatAllowedStatus(status: string) {
  return status === 'PAYMENT_CONFIRMED' || status === 'COMPLETED'
}

async function requireThreadAccess(threadId: string, userId: string, isAdmin: boolean) {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      order: { include: { book: true } },
      buyer: { select: { id: true, name: true, email: true, phone: true } },
      seller: { select: { id: true, name: true, email: true, phone: true } },
    },
  })

  if (!thread) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }

  const allowed = thread.buyerId === userId || thread.sellerId === userId || isAdmin
  if (!allowed) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  if (!chatAllowedStatus(thread.order.status)) {
    return { error: NextResponse.json({ error: 'Chat is available after payment is confirmed' }, { status: 403 }) }
  }

  return { thread }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { threadId } = await params
  const access = await requireThreadAccess(threadId, session.id, session.isAdmin)
  if ('error' in access) return access.error

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })

  return NextResponse.json({ thread: access.thread, messages })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { threadId } = await params
  const access = await requireThreadAccess(threadId, session.id, session.isAdmin)
  if ('error' in access) return access.error

  let parsed
  try {
    parsed = sendSchema.parse(await request.json())
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId: session.id,
      content: parsed.content,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  })

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  })

  publish(threadId, { type: 'message', message })

  return NextResponse.json({ message })
}

