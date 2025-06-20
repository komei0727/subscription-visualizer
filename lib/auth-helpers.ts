import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

export async function auth() {
  return await getServerSession(authOptions)
}

/**
 * Check if user registration is disabled
 * @returns true if registration is disabled, false otherwise
 */
export function isRegistrationDisabled(): boolean {
  return process.env.READ_ONLY_MODE === 'true'
}

/**
 * Check if the application is in read-only mode
 * @returns true if in read-only mode, false otherwise
 */
export function isReadOnlyMode(): boolean {
  return process.env.READ_ONLY_MODE === 'true'
}
