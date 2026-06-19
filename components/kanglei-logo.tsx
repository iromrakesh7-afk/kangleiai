import { cn } from '@/lib/utils'

/**
 * Kanglei AI mark — a stylized emblem inspired by the Kangla Sa (the
 * mythical dragon-lion of Manipur's Kangla fort), rendered as a simple
 * geometric monogram so it reads cleanly at any size.
 */
export function KangleiLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8', className)}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="currentColor" />
      <path
        d="M24 9l3.6 7.7 8.4 1-6 6 1.5 8.3L24 35l-7.5 4 1.5-8.3-6-6 8.4-1L24 9z"
        fill="var(--color-accent, #e0b24d)"
      />
      <circle cx="24" cy="24" r="3.2" fill="currentColor" />
    </svg>
  )
}
