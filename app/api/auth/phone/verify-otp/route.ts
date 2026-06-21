import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import {
  formatPhoneNumber,
  verifyOTP,
  deleteOTP,
} from '@/lib/phone-auth'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber, otp } = body

    if (!phoneNumber || !otp) {
      return Response.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Verify OTP
    const isValid = await verifyOTP(formattedPhone, otp, db)
    if (!isValid) {
      return Response.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if user exists with this phone number
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.phoneNumber, formattedPhone))
      .limit(1)

    let userId: string
    let isNewUser = false

    if (existingUser.length > 0) {
      // Update existing user's verified status
      userId = existingUser[0].id
      await db
        .update(user)
        .set({
          phoneVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
    } else {
      // Create new user
      isNewUser = true
      userId = crypto.randomUUID()
      const phone = formattedPhone.replace(/\D/g, '')
      const name = `User_${phone.slice(-4)}`

      await db.insert(user).values({
        id: userId,
        name,
        email: `phone_${formattedPhone.replace(/\D/g, '')}@kanglei.local`,
        emailVerified: false,
        phoneNumber: formattedPhone,
        phoneVerified: true,
      })
    }

    // Delete OTP after successful verification
    await deleteOTP(formattedPhone, db)

    // Create session using Better Auth
    const session = await auth.api.createSession({
      userId,
    })

    return Response.json({
      success: true,
      message: isNewUser ? 'Account created' : 'Logged in successfully',
      userId,
      isNewUser,
      session,
    })
  } catch (error) {
    console.error('[v0] Verify OTP error:', error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to verify OTP',
      },
      { status: 500 }
    )
  }
}
