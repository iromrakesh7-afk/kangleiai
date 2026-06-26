'use client'

import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowHelp(!showHelp)}
        className="text-muted-foreground hover:text-foreground"
        title="Keyboard shortcuts (? or click to toggle)"
      >
        <HelpCircle className="size-4" />
      </Button>

      {showHelp && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
          <h3 className="mb-3 font-semibold text-foreground">Keyboard Shortcuts</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-2 font-medium text-muted-foreground">Model Selection</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Ctrl/⌘ + 1-4</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 text-xs">Switch model</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ctrl/⌘ + N</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 text-xs">Next model</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ctrl/⌘ + P</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 text-xs">Previous model</kbd>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 font-medium text-muted-foreground">General</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>Ctrl/⌘ + M</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 text-xs">Chat/Search</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ctrl/⌘ + L</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 text-xs">Toggle lang</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Enter</span>
                  <kbd className="rounded bg-muted px-2 py-0.5 text-xs">Send</kbd>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowHelp(false)}
            className="mt-3 w-full rounded bg-muted py-1 text-xs text-muted-foreground hover:bg-muted/80"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
