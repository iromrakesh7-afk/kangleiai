import { Twilio } from 'twilio'
import crypto from 'crypto'

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  throw new Error('Missing Twilio environment variables')
}

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

/**
 * Validate phone number format (E.164 format)
 * Accepts: +1234567890, +44 1234 567890, etc.
 */
export function validatePhoneNumber(phone: string): boolean {
  const e164Regex = /^\+?[1-9]\d{1,14}$/
  const cleaned = phone.replace(/\s|-|\(|\)/g, '')
  return e164Regex.test(cleaned)
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\s|-|\(|\)/g, '')
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  }
  return cleaned
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Send OTP via SMS using Twilio
 */
export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
  try {
    // In development, log OTP instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[v0] DEV MODE: OTP for ${phoneNumber} is: ${otp} (expires in 10 minutes)`
      )
      return
    }

    await twilioClient.messages.create({
      body: `Your Kanglei AI verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phoneNumber,
    })
  } catch (error) {
    console.error('[v0] Failed to send OTP:', error)
    throw new Error('Failed to send verification code')
  }
}

/**
 * Verify OTP from verification table
 */
export async function verifyOTP(
  identifier: string,
  otp: string,
  db: any
): Promise<boolean> {
  const { verification } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')

  const record = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, `phone_otp_${identifier}`))
    .limit(1)

  if (!record.length) {
    return false
  }

  const { value, expiresAt } = record[0]
  
  // Check if OTP is expired
  if (new Date() > new Date(expiresAt)) {
    return false
  }

  // Verify OTP value
  return value === otp
}

/**
 * Store OTP in verification table with 10-minute expiry
 */
export async function storeOTP(
  identifier: string,
  otp: string,
  db: any
): Promise<void> {
  const { verification } = await import('@/lib/db/schema')
  const { eq, and } = await import('drizzle-orm')

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  // Delete any existing OTP for this identifier
  await db.delete(verification).where(
    eq(verification.identifier, `phone_otp_${identifier}`)
  )

  // Store new OTP
  await db.insert(verification).values({
    id: crypto.randomUUID(),
    identifier: `phone_otp_${identifier}`,
    value: otp,
    expiresAt,
  })
}

/**
 * Delete OTP after verification
 */
export async function deleteOTP(identifier: string, db: any): Promise<void> {
  const { verification } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')

  await db.delete(verification).where(
    eq(verification.identifier, `phone_otp_${identifier}`)
  )
}
