import { Twilio } from 'twilio'
import crypto from 'crypto'
import { verification } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

let twilioClient: Twilio | null = null

// Lazy load Twilio client only if credentials are available
function getTwilioClient(): Twilio {
  if (!twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio environment variables')
    }
    twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  }
  return twilioClient
}

type AnyDB = any

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

    const client = getTwilioClient()
    await client.messages.create({
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
  db: AnyDB
): Promise<boolean> {
  try {
    const record = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, `phone_otp_${identifier}`))
      .limit(1)

    if (!record || record.length === 0) {
      return false
    }

    const { value, expiresAt } = record[0]
    
    // Check if OTP is expired
    if (new Date() > new Date(expiresAt)) {
      return false
    }

    // Verify OTP value
    return value === otp
  } catch (error) {
    console.error('[v0] Error verifying OTP:', error)
    return false
  }
}

/**
 * Store OTP in verification table with 10-minute expiry
 */
export async function storeOTP(
  identifier: string,
  otp: string,
  db: AnyDB
): Promise<void> {
  try {
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
  } catch (error) {
    console.error('[v0] Error storing OTP:', error)
    throw error
  }
}

/**
 * Delete OTP after verification
 */
export async function deleteOTP(identifier: string, db: AnyDB): Promise<void> {
  try {
    await db.delete(verification).where(
      eq(verification.identifier, `phone_otp_${identifier}`)
    )
  } catch (error) {
    console.error('[v0] Error deleting OTP:', error)
    throw error
  }
}
