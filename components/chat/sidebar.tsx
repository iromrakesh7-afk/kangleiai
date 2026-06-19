'use client'

import { KangleiLogo } from '@/components/kanglei-logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { LogIn, LogOut, MessageSquarePlus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface ChatSummary {
  id: string
  title: string
}

export function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  user,
}: {
  chats: ChatSummary[]
  activeChatId: string | null
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  user: { name: string; email: string } | null
}) {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <KangleiLogo className="size-9 text-sidebar-primary" />
        <div className="leading-tight">
          <p className="font-heading text-lg font-semibold">Kanglei AI</p>
          <p className="text-xs text-sidebar-foreground/60">by Rakesh Irom</p>
        </div>
      </div>

      <div className="px-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
        >
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="mt-4 flex-1 px-3">
        {chats.length === 0 ? (
          <p className="px-2 py-4 text-sm text-sidebar-foreground/50">
            {user
              ? 'No conversations yet.'
              : 'Sign in to save your conversations.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-1 pb-4">
            {chats.map((c) => (
              <li key={c.id} className="group relative">
                <button
                  onClick={() => onSelectChat(c.id)}
                  className={cn(
                    'w-full truncate rounded-lg px-3 py-2 pr-9 text-left text-sm transition-colors',
                    c.id === activeChatId
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50',
                  )}
                >
                  {c.title}
                </button>
                <button
                  onClick={() => onDeleteChat(c.id)}
                  aria-label="Delete chat"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-sidebar-foreground/50 opacity-0 transition-opacity hover:bg-sidebar-border hover:text-sidebar-foreground group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary font-medium text-sidebar-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="rounded-md p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => router.push('/sign-in')}
            className="w-full justify-start gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogIn className="size-4" />
            Sign in to save chats
          </Button>
        )}
      </div>
    </aside>
  )
}
