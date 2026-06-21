'use client'

import { KangleiLogo } from '@/components/kanglei-logo'
import type { ChatMode } from '@/lib/models'
import { ImageIcon, MessagesSquare, Search } from 'lucide-react'

const SUGGESTIONS: Record<ChatMode, { icon: typeof Search; text: string }[]> = {
  chat: [
    { icon: MessagesSquare, text: 'Explain quantum computing in simple terms' },
    { icon: MessagesSquare, text: 'Write a haiku about the Loktak Lake' },
    { icon: MessagesSquare, text: 'Help me plan a 3-day trip to Manipur' },
    { icon: MessagesSquare, text: 'Draft a polite follow-up email' },
    { icon: MessagesSquare, text: 'মণিপুর লোইনবা পান সীমনা উঙ্গাই পীবা' },
    { icon: MessagesSquare, text: 'লোকতাক লেইমা পান থেমলেই' },
  ],
  search: [
    { icon: Search, text: 'Latest developments in AI this week' },
    { icon: Search, text: 'Who won the most recent F1 race?' },
    { icon: Search, text: 'Current weather in Imphal' },
    { icon: Search, text: 'Best-reviewed laptops right now' },
  ],
  image: [
    { icon: ImageIcon, text: 'A serene sunrise over Loktak Lake, oil painting' },
    { icon: ImageIcon, text: 'A futuristic city blended with Manipuri motifs' },
    { icon: ImageIcon, text: 'A majestic Sangai deer in a misty forest' },
    { icon: ImageIcon, text: 'Minimalist logo of a phoenix in gold and crimson' },
  ],
}

export function Welcome({
  mode,
  onPick,
}: {
  mode: ChatMode
  onPick: (text: string) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <KangleiLogo className="size-16 text-primary" />
      <h1 className="mt-5 text-balance font-heading text-3xl font-semibold sm:text-4xl">
        How can I help you today?
      </h1>
      <p className="mt-2 max-w-md text-pretty text-muted-foreground">
        Kanglei AI — intelligent chat, live web search, and image generation.
        Proudly built in Manipur by Rakesh Irom.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS[mode].map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.text}
              onClick={() => onPick(s.text)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-muted"
            >
              <Icon className="size-4 shrink-0 text-primary" />
              <span className="text-pretty">{s.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
