'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import styles from '@/styles/modern-auth.module.css'

export function ModernAuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Ensure the admin account exists before the admin tries to sign in
      if (signInEmail.trim().toLowerCase() === 'iromrakesh7@gmail.com') {
        await fetch('/api/admin/setup', { method: 'POST' })
      }

      const { error: signInError } = await authClient.signIn.email({
        email: signInEmail.trim(),
        password: signInPassword,
      })

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.signInOnly} id="container">
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {/* Sign In Form */}
      <div className={styles.formContainerSignInOnly}>
        <form onSubmit={handleSignIn}>
          <h1>Sign In to Kanglei AI</h1>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.icon} onClick={(e) => {
              e.preventDefault()
              handleGoogleSignIn()
            }}>
              <i className="fa-brands fa-google-plus-g"></i>
            </a>
            <a href="#" className={styles.icon}><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" className={styles.icon}><i className="fa-brands fa-github"></i></a>
            <a href="#" className={styles.icon}><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
          <span>or use your email password</span>
          <input
            type="email"
            placeholder="Email"
            value={signInEmail}
            onChange={(e) => setSignInEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={signInPassword}
            onChange={(e) => setSignInPassword(e.target.value)}
            required
          />
          <a href="#">Forgot Your Password?</a>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}
