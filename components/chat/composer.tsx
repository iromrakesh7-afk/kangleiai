'use client'

import { Button } from '@/components/ui/button'
import type { ChatMode } from '@/lib/models'
import { ArrowUp, Square } from 'lucide-react'
import { useRef, type FormEvent, type KeyboardEvent } from 'react'

const PLACEHOLDERS: Record<ChatMode, string> = {
  chat: 'Message Kanglei AI…',
  search: 'Search the web with Kanglei AI…',
  image: 'Describe an image to generate…',
}

export function Composer({
  input,
  setInput,
  onSubmit,
  onStop,
  busy,
  mode,
}: {
  input: string
  setInput: (v: string) => void
  onSubmit: () => void
  onStop: () => void
  busy: boolean
  mode: ChatMode
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy || !input.trim()) return
    onSubmit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!busy && input.trim()) onSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={PLACEHOLDERS[mode]}
        className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-[0.95rem] leading-relaxed outline-none placeholder:text-muted-foreground"
      />
      {busy && mode !== 'image' ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={onStop}
          className="size-9 shrink-0 rounded-xl"
          aria-label="Stop generating"
        >
          <Square className="size-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={busy || !input.trim()}
          className="size-9 shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
    </form>
  )
}
