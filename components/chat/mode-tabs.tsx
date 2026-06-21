'use client'

import type { ChatMode } from '@/lib/models'
import { cn } from '@/lib/utils'
import { ImageIcon, MessagesSquare, Search } from 'lucide-react'

const MODES: { id: ChatMode; label: string; icon: typeof Search; disabled?: boolean }[] = [
  { id: 'chat', label: 'Chat', icon: MessagesSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'image', label: 'Image', icon: ImageIcon, disabled: true },
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
            disabled={disabled || m.disabled}
            onClick={() => onChange(m.id)}
            title={m.disabled ? 'Coming soon' : `${m.label} (Ctrl+M)`}
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
