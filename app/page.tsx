import { getChats } from '@/app/actions/chats'
import { ChatApp } from '@/components/chat/chat-app'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export default async function Home() {
  let user: { name: string; email: string; isAdmin: boolean } | null = null

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) {
      const [dbUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1)

      user = {
        name: session.user.name,
        email: session.user.email,
        isAdmin: dbUser?.isAdmin ?? false,
      }
    }
  } catch {
    // Auth not configured yet — fall back to guest mode (no saved history).
  }

  const chatList = user
    ? (await getChats()).map((c) => ({ id: c.id, title: c.title }))
    : []

  return <ChatApp initialChats={chatList} user={user} />
}
