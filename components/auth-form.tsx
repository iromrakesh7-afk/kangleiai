'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { PhoneInput } from '@/components/phone-auth/phone-input'
import { OTPVerification } from '@/components/phone-auth/otp-verification'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [otpSent, setOtpSent] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (phone: string) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send OTP')
      }

      setPhoneNumber(phone)
      setOtpSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to verify OTP')
      }

      const data = await response.json()
      
      // Create session using auth client
      await authClient.getSession()
      
      // Redirect to home
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToPhone = () => {
    setOtpSent(false)
    setPhoneNumber('')
    setError('')
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative size-10 shrink-0">
              <Image
                src="/kanglei-logo.png"
                alt="Kanglei AI"
                fill
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <p className="font-heading text-lg font-semibold">Kanglei AI</p>
              <p className="text-xs text-muted-foreground">by Rakesh Irom</p>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {mode === 'sign-up' ? 'Join Kanglei AI' : 'Welcome back'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {authMethod === 'phone'
              ? 'Sign in with your phone number'
              : mode === 'sign-up'
                ? 'Sign up with your Google account to get started'
                : 'Sign in with your Google account to continue'}
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={authMethod === 'google' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => {
              setAuthMethod('google')
              setOtpSent(false)
              setError('')
            }}
          >
            Google
          </Button>
          <Button
            variant={authMethod === 'phone' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => {
              setAuthMethod('phone')
              setError('')
            }}
          >
            Phone
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {authMethod === 'google' ? (
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-medium"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        ) : otpSent ? (
          <OTPVerification
            phoneNumber={phoneNumber}
            onVerify={handleVerifyOTP}
            onBack={handleBackToPhone}
            loading={isLoading}
          />
        ) : (
          <PhoneInput onSubmit={handleSendOTP} loading={isLoading} />
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            {mode === 'sign-up'
              ? 'By signing up, you agree to our Terms of Service'
              : 'Secure authentication powered by Google and Twilio'}
          </p>
        </div>
      </Card>
    </main>
  )
}
