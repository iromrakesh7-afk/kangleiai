'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CHAT_MODELS } from '@/lib/models'
import { Check, ChevronDown } from 'lucide-react'

export function ModelSelector({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const current = CHAT_MODELS.find((m) => m.id === value) ?? CHAT_MODELS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="size-2 rounded-full bg-primary" />
        {current.name}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Choose a model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CHAT_MODELS.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <span className="flex w-full items-center justify-between">
              <span className="font-medium">{m.name}</span>
              {m.id === value && <Check className="size-4 text-primary" />}
            </span>
            <span className="text-xs text-muted-foreground">
              {m.provider} · {m.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
