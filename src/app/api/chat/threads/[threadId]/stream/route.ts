import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { subscribe } from '@/lib/chatBroker'

function chatAllowedStatus(status: string) {
  return status === 'PAYMENT_CONFIRMED' || status === 'COMPLETED'
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { threadId } = await params

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { buyerId: true, sellerId: true, order: { select: { status: true } } },
  })

  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowed = thread.buyerId === session.id || thread.sellerId === session.id || session.isAdmin
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!chatAllowedStatus(thread.order.status)) {
    return NextResponse.json({ error: 'Chat is available after payment is confirmed' }, { status: 403 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      // initial event
      send({ type: 'ready' })

      const unsubscribe = subscribe(threadId, send)

      const abort = () => {
        unsubscribe()
        try {
          controller.close()
        } catch {
          // ignore
        }
      }

      request.signal.addEventListener('abort', abort)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

