import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'アカウントの作成に失敗しました' },
      { status: 500 }
    )
  }
}