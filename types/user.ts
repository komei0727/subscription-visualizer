import { User as PrismaUser } from '@prisma/client'

export type User = Omit<PrismaUser, 'hashedPassword'>

export interface RegisterUserDto {
  email: string
  password: string
  name?: string
}

export interface LoginUserDto {
  email: string
  password: string
}