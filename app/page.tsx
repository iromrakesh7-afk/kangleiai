import { getChats } from '@/app/actions/chats'
import { ChatApp } from '@/components/chat/chat-app'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const revalidate = 3600 // Revalidate every hour

// Force Vercel rebuild - popup removed
export default async function Home() {
  let user: { name: string; email: string; isAdmin: boolean } | null = null
  let chatList: { id: string; title: string }[] = []

  try {
    const hdrs = await headers()
    const session = await auth.api.getSession({ headers: hdrs })
    
    if (session?.user) {
      // Get user with admin status in single query
      const [dbUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1)

      if (dbUser) {
        user = {
          name: dbUser.name,
          email: dbUser.email,
          isAdmin: dbUser.isAdmin,
        }
        // Fetch chats in parallel with user fetch
        chatList = (await getChats()).map((c) => ({ id: c.id, title: c.title }))
      }
    }
  } catch (error) {
    // Auth not configured yet — fall back to guest mode
    console.error('[v0] Auth error:', error instanceof Error ? error.message : String(error))
  }

  return <ChatApp initialChats={chatList} user={user} />
}
