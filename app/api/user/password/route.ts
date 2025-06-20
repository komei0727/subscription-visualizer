import { NextRequest, NextResponse } from 'next/server'
import { auth, isReadOnlyMode } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
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
    const data = passwordUpdateSchema.parse(body)

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        hashedPassword: true,
      },
    })

    if (!user?.hashedPassword) {
      return NextResponse.json(
        { error: 'User not found or password not set' },
        { status: 400 }
      )
    }

    // Verify current password
    const isPasswordValid = await compare(
      data.currentPassword,
      user.hashedPassword
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(data.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hashedPassword,
      },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
