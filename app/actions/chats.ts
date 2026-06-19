'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chats, messages } from '@/lib/db/schema'
import type { UIMessage } from 'ai'
import { and, asc, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserIdOrNull(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

export async function getChats() {
  const userId = await getUserIdOrNull()
  if (!userId) return []
  return db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
}

export async function getChatMessages(chatId: string) {
  const userId = await getUserIdOrNull()
  if (!userId) return []
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))
    .orderBy(asc(messages.createdAt))
  return rows.map((r) => ({
    id: r.id,
    role: r.role as UIMessage['role'],
    parts: r.parts as UIMessage['parts'],
  }))
}

function deriveTitle(msgs: UIMessage[]): string {
  const firstUser = msgs.find((m) => m.role === 'user')
  if (!firstUser) return 'New chat'
  const text = (firstUser.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
    .trim()
  if (!text) return 'New chat'
  return text.length > 48 ? text.slice(0, 48) + '…' : text
}

export async function saveChat(chatId: string, msgs: UIMessage[]) {
  const userId = await getUserIdOrNull()
  if (!userId) return { saved: false as const }

  const existing = await db
    .select({ id: chats.id })
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))

  if (existing.length === 0) {
    await db.insert(chats).values({
      id: chatId,
      userId,
      title: deriveTitle(msgs),
    })
  } else {
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  }

  // Replace messages for this chat with the latest full history.
  await db
    .delete(messages)
    .where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))

  if (msgs.length > 0) {
    await db.insert(messages).values(
      msgs.map((m) => ({
        id: m.id,
        chatId,
        userId,
        role: m.role,
        parts: m.parts as unknown as object,
      })),
    )
  }

  return { saved: true as const }
}

export async function deleteChat(chatId: string) {
  const userId = await getUserIdOrNull()
  if (!userId) return
  await db
    .delete(messages)
    .where(and(eq(messages.chatId, chatId), eq(messages.userId, userId)))
  await db
    .delete(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
}
