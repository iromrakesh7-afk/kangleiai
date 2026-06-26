'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import styles from '@/styles/modern-auth.module.css'
import { X } from 'lucide-react'

export function AuthModal() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up state
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: signInEmail.trim(),
        password: signInPassword,
      })

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (signUpPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: signUpEmail.trim(),
        password: signUpPassword,
        name: signUpName.trim(),
      })

      if (signUpError) {
        setError(signUpError.message || 'Sign up failed')
        setIsLoading(false)
        return
      }

      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError('')
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google authentication failed'
      setError(message)
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSignInEmail('')
    setSignInPassword('')
    setSignUpName('')
    setSignUpEmail('')
    setSignUpPassword('')
    setSignUpConfirmPassword('')
  }

  return (
    <div className={styles.authModalOverlay}>
      <div className={styles.authModalContainer}>
        <button
          className={styles.authModalClose}
          onClick={() => {}}
          disabled={true}
          title="You must log in to continue"
        >
          <X size={24} />
        </button>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.authModalForm}>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <h1>{isSignUp ? 'Create Account' : 'Sign In to Kanglei AI'}</h1>
            <p className={styles.authModalSubtitle}>
              {isSignUp ? 'Create a new account to start chatting' : 'Sign in to access your chats'}
            </p>

            <div className={styles.socialIcons}>
              <a href="#" className={styles.icon} onClick={(e) => {
                e.preventDefault()
                handleGoogleAuth()
              }}>
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className={styles.icon}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className={styles.icon}><i className="fa-brands fa-github"></i></a>
              <a href="#" className={styles.icon}><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
            <span>or use your email {isSignUp ? 'to register' : 'password'}</span>

            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={isSignUp ? signUpEmail : signInEmail}
              onChange={(e) => isSignUp ? setSignUpEmail(e.target.value) : setSignInEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={isSignUp ? signUpPassword : signInPassword}
              onChange={(e) => isSignUp ? setSignUpPassword(e.target.value) : setSignInPassword(e.target.value)}
              required
            />

            {isSignUp && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={signUpConfirmPassword}
                onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                required
              />
            )}

            {!isSignUp && (
              <a href="#">Forgot Your Password?</a>
            )}

            <button type="submit" disabled={isLoading}>
              {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
            </button>

            <div className={styles.toggleAuth}>
              {isSignUp ? (
                <p>
                  Already have an account? <button type="button" onClick={toggleMode} className={styles.toggleLink}>Sign In</button>
                </p>
              ) : (
                <p>
                  Don&apos;t have an account? <button type="button" onClick={toggleMode} className={styles.toggleLink}>Register</button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
