import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { subscriptionSchema } from '@/lib/validations/subscription'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        nextBillingDate: 'asc',
      },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('GET subscriptions error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = subscriptionSchema.parse(body)

    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        userId: session.user.id,
        amount: data.amount,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('POST subscription error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}