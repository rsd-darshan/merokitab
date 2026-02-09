import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  description: z.string().min(1),
  sellerPrice: z.number().positive(),
  imageUrl: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'AVAILABLE'
    const sellerId = searchParams.get('sellerId')

    const where: any = {
      status: status as any,
    }

    // Filter by seller if sellerId is provided
    if (sellerId) {
      where.sellerId = sellerId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ]
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createBookSchema.parse(body)

    // Calculate platform price (seller price + 10%)
    const platformPrice = Math.ceil(data.sellerPrice * 1.1)

    const book = await prisma.book.create({
      data: {
        ...data,
        sellerPrice: data.sellerPrice,
        platformPrice,
        sellerId: session.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ book })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
