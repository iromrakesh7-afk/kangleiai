import { db } from '@/lib/db'
import {
  validatePhoneNumber,
  formatPhoneNumber,
  generateOTP,
  sendOTP,
  storeOTP,
} from '@/lib/phone-auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNumber } = body

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return Response.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      return Response.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Format to E.164
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Generate OTP
    const otp = generateOTP()

    // Store OTP in database
    await storeOTP(formattedPhone, otp, db)

    // Send OTP via SMS
    await sendOTP(formattedPhone, otp)

    return Response.json({
      success: true,
      message: 'OTP sent to phone number',
      phoneNumber: formattedPhone,
    })
  } catch (error) {
    console.error('[v0] Send OTP error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
