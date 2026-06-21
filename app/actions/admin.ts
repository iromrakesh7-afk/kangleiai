'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

const ADMIN_EMAIL = 'iromrakesh7@gmail.com'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function checkIsAdmin() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return false
    
    const [userRecord] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1)
    
    return userRecord?.isAdmin ?? false
  } catch {
    return false
  }
}

export async function promoteAdminUser() {
  const userId = await getUserId()
  const [currentUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)
  
  if (currentUser?.email !== ADMIN_EMAIL) {
    throw new Error('Only the designated admin can be promoted')
  }
  
  await db
    .update(userTable)
    .set({ isAdmin: true })
    .where(eq(userTable.id, userId))
  
  return { success: true }
}

export async function getAdminStats() {
  const userId = await getUserId()
  const [userRecord] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)
  
  if (!userRecord?.isAdmin) {
    throw new Error('Admin access required')
  }
  
  const allUsers = await db.select().from(userTable)
  const totalChats = await db.select().from(userTable)
  
  return {
    totalUsers: allUsers.length,
    adminUsers: allUsers.filter(u => u.isAdmin).length,
    totalChats: totalChats.length,
  }
}
