import { getChats } from '@/app/actions/chats'
import { ChatApp } from '@/components/chat/chat-app'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function Home() {
  let user: { name: string; email: string } | null = null

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) {
      user = { name: session.user.name, email: session.user.email }
    }
  } catch {
    // Auth not configured yet — fall back to guest mode (no saved history).
  }

  const chatList = user
    ? (await getChats()).map((c) => ({ id: c.id, title: c.title }))
    : []

  return <ChatApp initialChats={chatList} user={user} />
}
