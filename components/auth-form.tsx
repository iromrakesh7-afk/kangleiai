'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KangleiLogo } from '@/components/kanglei-logo'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

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

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2.5">
            <KangleiLogo className="size-9 text-primary" />
            <div className="leading-tight">
              <p className="font-heading text-lg font-semibold">Kanglei AI</p>
              <p className="text-xs text-muted-foreground">by Rakesh Irom</p>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {mode === 'sign-up' ? 'Join Kanglei AI' : 'Welcome back'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'sign-up'
              ? 'Sign up with your Google account to get started'
              : 'Sign in with your Google account to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-medium"
        >
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            {mode === 'sign-up'
              ? 'By signing up, you agree to our Terms of Service'
              : 'Secure sign-in powered by Google'}
          </p>
        </div>
      </Card>
    </main>
  )
}
