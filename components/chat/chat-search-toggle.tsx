'use client'

import { MessagesSquare, Search } from 'lucide-react'
import { type ChatMode } from '@/lib/models'

export function ChatSearchToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: ChatMode
  onChange: (mode: ChatMode) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card/40 p-1 backdrop-blur-sm">
      {/* Chat button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('chat')}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          mode === 'chat'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        title="Chat Mode (Ctrl+M)"
        aria-label="Switch to chat mode"
      >
        <MessagesSquare className="size-4" />
        <span>Chat</span>
      </button>

      {/* Search button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('search')}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          mode === 'search'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        title="Search Mode (Ctrl+M)"
        aria-label="Switch to search mode"
      >
        <Search className="size-4" />
        <span>Search</span>
      </button>
    </div>
  )
}
