import { NextRequest, NextResponse } from 'next/server'
import { auth, isReadOnlyMode } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function PUT(req: NextRequest) {
  try {
    // Check if in read-only mode
    if (isReadOnlyMode()) {
      return NextResponse.json(
        { error: '読み取り専用モードのため、この操作は許可されていません' },
        { status: 403 }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = profileUpdateSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
