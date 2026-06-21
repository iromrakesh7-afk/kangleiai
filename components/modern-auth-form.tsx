'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import styles from '@/styles/modern-auth.module.css'

export function ModernAuthForm() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  
  // Sign Up state
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: signUpEmail.trim(),
        password: signUpPassword,
        name: signUpName.trim() || signUpEmail.trim(),
      })

      if (signUpError) {
        setError(signUpError.message || 'Sign up failed')
        setIsLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
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
    <div className={`${styles.container} ${isActive ? styles.active : ''}`} id="container">
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {/* Sign Up Form */}
      <div className={`${styles.formContainer} ${styles.signUp}`}>
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
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
          <span>or use your email for registration</span>
          <input
            type="text"
            placeholder="Name"
            value={signUpName}
            onChange={(e) => setSignUpName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className={`${styles.formContainer} ${styles.signIn}`}>
        <form onSubmit={handleSignIn}>
          <h1>Sign In</h1>
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Toggle Container */}
      <div className={styles.toggleContainer}>
        <div className={styles.toggle}>
          <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button 
              className={`${styles.hidden} ${styles.toggleBtn}`}
              onClick={() => setIsActive(false)}
            >
              Sign In
            </button>
          </div>
          <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details to use all of site features</p>
            <button 
              className={`${styles.hidden} ${styles.toggleBtn}`}
              onClick={() => setIsActive(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
