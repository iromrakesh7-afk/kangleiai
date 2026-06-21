import { ModernAuthForm } from '@/components/modern-auth-form'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  let hasSession = false
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    hasSession = Boolean(session?.user)
  } catch {
    // BETTER_AUTH_SECRET not configured yet — show the form anyway.
  }
  if (hasSession) redirect('/')
  return (
    <main className="min-h-svh bg-gradient-to-r from-gray-200 to-blue-200 flex items-center justify-center px-4">
      <ModernAuthForm />
    </main>
  )
}
