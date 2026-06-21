'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from 'lucide-react'

export function OTPVerification({
  phoneNumber,
  onVerify,
  onBack,
  loading = false,
}: {
  phoneNumber: string
  onVerify: (otp: string) => Promise<void>
  onBack: () => void
  loading?: boolean
}) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    try {
      await onVerify(otp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    }
  }

  const handleResend = async () => {
    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend OTP')
      }

      setTimeLeft(600)
      setCanResend(false)
      setOtp('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Verification Code
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          disabled={loading}
          className="w-full text-center text-2xl tracking-widest"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Code expires in: {formatTime(timeLeft)}
        </span>
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-primary hover:underline"
          >
            Resend Code
          </button>
        ) : (
          <span className="text-muted-foreground">Resend available soon</span>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>
      </div>
    </form>
  )
}
