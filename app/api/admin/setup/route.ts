import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

const ADMIN_EMAIL = 'iromrakesh7@gmail.com'
const ADMIN_PASSWORD = 'vince9863'

/**
 * Idempotent admin bootstrap.
 * Creates the admin account through Better Auth (so the password is hashed and
 * stored in the `account` table) and marks the user row as admin.
 * Safe to call repeatedly — it no-ops once the admin exists.
 */
export async function POST() {
  try {
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL))
      .limit(1)

    if (existing.length > 0) {
      // Make sure the admin flag is set even if the row was created another way.
      if (!existing[0].isAdmin) {
        await db
          .update(user)
          .set({ isAdmin: true })
          .where(eq(user.email, ADMIN_EMAIL))
      }
      return Response.json({ success: true, message: 'Admin already exists' })
    }

    // Create the admin via Better Auth so the password hash lands in `account`.
    await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Rakesh Irom',
      },
    })

    // Promote the freshly created user to admin.
    await db
      .update(user)
      .set({ isAdmin: true, emailVerified: true })
      .where(eq(user.email, ADMIN_EMAIL))

    return Response.json({ success: true, message: 'Admin user created' })
  } catch (error) {
    console.error('[v0] Admin setup error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    )
  }
}
