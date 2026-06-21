import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

/**
 * Setup admin user - this endpoint should only be called once during setup
 */
export async function POST(req: Request) {
  try {
    // Security: Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, 'iromrakesh7@gmail.com'))
      .limit(1)

    if (existingAdmin.length > 0) {
      return Response.json(
        { success: false, message: 'Admin user already exists' },
        { status: 400 }
      )
    }

    // Create admin user
    const adminId = crypto.randomUUID()
    const adminUser = await db
      .insert(user)
      .values({
        id: adminId,
        name: 'Admin - Rakesh Irom',
        email: 'iromrakesh7@gmail.com',
        emailVerified: true,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return Response.json({
      success: true,
      message: 'Admin user created successfully',
      user: adminUser[0],
    })
  } catch (error) {
    console.error('[v0] Admin setup error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    )
  }
}

/**
 * Verify admin endpoint
 */
export async function GET(req: Request) {
  try {
    const admin = await db
      .select()
      .from(user)
      .where(eq(user.email, 'iromrakesh7@gmail.com'))
      .limit(1)

    if (admin.length === 0) {
      return Response.json(
        { exists: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    return Response.json({
      exists: true,
      admin: {
        id: admin[0].id,
        name: admin[0].name,
        email: admin[0].email,
        isAdmin: admin[0].isAdmin,
      },
    })
  } catch (error) {
    console.error('[v0] Admin check error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Check failed' },
      { status: 500 }
    )
  }
}
