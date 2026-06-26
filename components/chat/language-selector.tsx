'use client'

import { SUPPORTED_LANGUAGES } from '@/lib/models'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
}: {
  currentLanguage: string
  onLanguageChange: (lang: string) => void
}) {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-xs px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer" title="Change language (Ctrl+L)">
        <Globe className="size-4" />
        <span className="hidden sm:inline">{currentLang?.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={currentLanguage === lang.code ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2">
              <span>{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">({lang.name})</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
