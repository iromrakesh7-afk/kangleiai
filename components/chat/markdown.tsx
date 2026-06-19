'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-kanglei max-w-none text-[0.95rem] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-3 list-disc pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mb-3 mt-2 font-heading text-xl font-semibold">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-2 font-heading text-lg font-semibold">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-2 font-heading text-base font-semibold">
              {children}
            </h3>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg bg-foreground/90 p-3 font-mono text-sm text-background">
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
          img: ({ src, alt }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src as string}
                alt={alt ?? 'Generated image'}
                className="my-2 max-w-full rounded-xl border border-border"
              />
            ) : null,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-accent pl-4 italic text-muted-foreground last:mb-0">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
