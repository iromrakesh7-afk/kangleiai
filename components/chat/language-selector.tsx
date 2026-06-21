'use client'

import { SUPPORTED_LANGUAGES } from '@/lib/models'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

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
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs"
          title="Change language"
        >
          <Globe className="size-4" />
          <span className="hidden sm:inline">{currentLang?.name}</span>
        </Button>
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
