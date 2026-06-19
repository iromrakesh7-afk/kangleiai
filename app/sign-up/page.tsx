import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SignUpPage() {
  let hasSession = false
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    hasSession = Boolean(session?.user)
  } catch {
    // BETTER_AUTH_SECRET not configured yet — show the form anyway.
  }
  if (hasSession) redirect('/')
  return <AuthForm mode="sign-up" />
}
