import { redirect } from 'next/navigation'

export default function SignUpPage() {
  // Redirect to sign-in which now has both sign-in and sign-up forms
  redirect('/sign-in')
}
