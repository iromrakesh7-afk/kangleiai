'use client'

import type { ChatMode } from '@/lib/models'
import { MessagesSquare, Search } from 'lucide-react'
import Image from 'next/image'

const SUGGESTIONS: Record<ChatMode, { icon: typeof Search; text: string }[]> = {
  chat: [
    { icon: MessagesSquare, text: 'Explain quantum computing in simple terms' },
    { icon: MessagesSquare, text: 'Write a haiku about the Loktak Lake' },
    { icon: MessagesSquare, text: 'Help me plan a 3-day trip to Manipur' },
    { icon: MessagesSquare, text: 'Draft a polite follow-up email' },
    { icon: MessagesSquare, text: 'ꯃꯅꯤꯄꯨꯔꯒꯤ ꯎꯎꯇꯐꯕꯥ ꯗꯨꯠꯄꯥ' },
    { icon: MessagesSquare, text: 'ꯂꯣꯀꯇꯥꯛ ꯂꯩꯃꯦꯀꯨ ꯀꯪꯖꯥꯢꯅꯥ ꯏꯟ ꯅꯦꯃꯥꯒꯨ' },
  ],
  search: [
    { icon: Search, text: 'Latest developments in AI this week' },
    { icon: Search, text: 'Who won the most recent F1 race?' },
    { icon: Search, text: 'Current weather in Imphal' },
    { icon: Search, text: 'Best-reviewed laptops right now' },
  ],
  image: [
    { icon: Search, text: 'Coming soon' },
    { icon: Search, text: 'Coming soon' },
    { icon: Search, text: 'Coming soon' },
    { icon: Search, text: 'Coming soon' },
  ],
}

export function Welcome({
  mode,
  onPick,
}: {
  mode: ChatMode
  onPick: (text: string) => void
}) {
  const isImageMode = mode === 'image'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      {/* Kanglei AI Logo */}
      <div className="relative size-20 mb-6">
        <Image
          src="/kanglei-logo.png"
          alt="Kanglei AI"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Main Heading */}
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        How can I help you today?
      </h1>

      {/* Subtitle */}
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Kanglei AI — intelligent chat, live web search, and image generation.
        Proudly built in Manipur by Rakesh Irom.
      </p>

      {/* Image Mode Coming Soon */}
      {isImageMode && (
        <div className="mt-12 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-8 py-12">
          <p className="text-lg font-semibold">Coming Soon</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Image generation is coming soon. Stay tuned!
          </p>
        </div>
      )}

      {/* Suggestion Cards */}
      {!isImageMode && (
        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {SUGGESTIONS[mode].map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.text}
                onClick={() => onPick(s.text)}
                className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-sm"
              >
                <Icon className="size-5 shrink-0 text-primary/60 transition-colors group-hover:text-primary" />
                <span className="text-pretty text-foreground">{s.text}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
