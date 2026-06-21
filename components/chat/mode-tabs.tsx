'use client'

import type { ChatMode } from '@/lib/models'
import { cn } from '@/lib/utils'
import { MessagesSquare, Search } from 'lucide-react'

const MODES: { id: ChatMode; label: string; icon: typeof Search }[] = [
  { id: 'chat', label: 'Chat', icon: MessagesSquare },
  { id: 'search', label: 'Search', icon: Search },
  // Image generation disabled (Groq does not support image generation)
]

export function ModeTabs({
  value,
  onChange,
  disabled,
}: {
  value: ChatMode
  onChange: (mode: ChatMode) => void
  disabled?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
      {MODES.map((m) => {
        const Icon = m.icon
        const active = m.id === value
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
