'use client'

import { KangleiLogo } from '@/components/kanglei-logo'
import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'
import { User } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Markdown } from './markdown'

function getText(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function MessageList({
  messages,
  busy,
}: {
  messages: UIMessage[]
  busy: boolean
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const lastIsUser = messages[messages.length - 1]?.role === 'user'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {messages.map((m) => {
        const isUser = m.role === 'user'
        const text = getText(m)
        return (
          <div
            key={m.id}
            className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
          >
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                isUser
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-primary text-primary-foreground',
              )}
            >
              {isUser ? (
                <User className="size-4" />
              ) : (
                <KangleiLogo className="size-8" />
              )}
            </div>
            <div
              className={cn(
                'min-w-0 max-w-[85%] rounded-2xl px-4 py-3',
                isUser
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-card text-card-foreground shadow-sm ring-1 ring-border',
              )}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                  {text}
                </p>
              ) : (
                <Markdown content={text || ' '} />
              )}
            </div>
          </div>
        )
      })}

      {busy && lastIsUser && (
        <div className="flex gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KangleiLogo className="size-8" />
          </div>
          <div className="flex items-center gap-1 rounded-2xl bg-card px-4 py-4 shadow-sm ring-1 ring-border">
            <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
