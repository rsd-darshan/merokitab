import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = signupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)
    const isAdmin = email === process.env.ADMIN_EMAIL

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        isAdmin,
      },
    })

    try {
      await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      })
    } catch (sessionError) {
      console.error('Session creation error:', sessionError)
      // User is created, but session failed - still return success
      // The user can login again
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 200 })
  } catch (error) {
    console.error('Signup error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Failed to sign up' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
