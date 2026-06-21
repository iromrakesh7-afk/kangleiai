import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '@/lib/password'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (users.length === 0) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const foundUser = users[0]

    // For users without password (OAuth only), prevent email/password login
    if (!foundUser.emailVerified) {
      return Response.json(
        { error: 'Please verify your email first or use Google sign-in' },
        { status: 401 }
      )
    }

    // Create a session via Better Auth
    // Note: This endpoint would need custom password verification
    // For now, we'll redirect to the OAuth flow
    return Response.json({
      success: false,
      error: 'Please use Google Sign-In or continue with Phone Authentication',
      redirectTo: '/sign-in',
    })
  } catch (error) {
    console.error('[v0] Sign in error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Sign in failed' },
      { status: 500 }
    )
  }
}
