'use client'

import {
  deleteChat as deleteChatAction,
  getChatMessages,
  getChats,
  saveChat,
} from '@/app/actions/chats'
import {
  DEFAULT_MODEL,
  getModelName,
  type ChatMode,
} from '@/lib/models'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Composer } from './composer'
import { ChatSearchToggle } from './chat-search-toggle'
import { LanguageSelector } from './language-selector'
import { MessageList } from './message-list'
import { ModeTabs } from './mode-tabs'
import { Sidebar, type ChatSummary } from './sidebar'
import { Welcome } from './welcome'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

export function ChatApp({
  initialChats,
  user,
}: {
  initialChats: ChatSummary[]
  user: { name: string; email: string; isAdmin: boolean } | null
}) {
  const [chats, setChats] = useState<ChatSummary[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [mode, setMode] = useState<ChatMode>('chat')
  const [language, setLanguage] = useState('en')
  const [input, setInput] = useState('')
  const [imageBusy, setImageBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: { messages, mode, language, ...body },
      }),
    }),
  })

  const busy = status === 'submitted' || status === 'streaming' || imageBusy

  // Refresh the sidebar chat list once a streamed response settles.
  const prevStatus = useRef(status)
  useEffect(() => {
    if (
      user &&
      prevStatus.current === 'streaming' &&
      status === 'ready'
    ) {
      getChats()
        .then((list) =>
          setChats(list.map((c) => ({ id: c.id, title: c.title }))),
        )
        .catch(() => {})
    }
    prevStatus.current = status
  }, [status, user])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + M: Toggle between Chat and Search modes
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault()
        setMode((currentMode) =>
          currentMode === 'chat' ? 'search' : 'chat'
        )
      }

      // Ctrl/Cmd + L: Toggle language
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        setLanguage((prev) => (prev === 'en' ? 'mni' : 'en'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function refreshChats() {
    if (!user) return
    try {
      const list = await getChats()
      setChats(list.map((c) => ({ id: c.id, title: c.title })))
    } catch {
      /* ignore */
    }
  }

  function startNewChat() {
    stop()
    setMessages([])
    setActiveChatId(null)
    setSidebarOpen(false)
  }

  async function selectChat(id: string) {
    if (id === activeChatId) {
      setSidebarOpen(false)
      return
    }
    stop()
    setActiveChatId(id)
    setSidebarOpen(false)
    const loaded = await getChatMessages(id)
    setMessages(loaded as UIMessage[])
  }

  async function removeChat(id: string) {
    setChats((prev) => prev.filter((c) => c.id !== id))
    if (id === activeChatId) startNewChat()
    await deleteChatAction(id)
  }

  async function generateImage(prompt: string, chatId: string) {
    const userMsg: UIMessage = {
      id: newId(),
      role: 'user',
      parts: [{ type: 'text', text: prompt }],
    }
    setMessages((prev) => [...prev, userMsg])
    setImageBusy(true)
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      const assistantMsg: UIMessage = {
        id: newId(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: data.image
              ? `![${prompt}](${data.image})`
              : `I couldn't generate that image. ${data.error ?? ''}`,
          },
        ],
      }
      setMessages((prev) => {
        const next = [...prev, assistantMsg]
        if (user && data.image) {
          saveChat(chatId, next)
            .then(refreshChats)
            .catch(() => {})
        }
        return next
      })
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          parts: [
            { type: 'text', text: 'Image generation failed. Please try again.' },
          ],
        },
      ])
    } finally {
      setImageBusy(false)
    }
  }

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    let chatId = activeChatId
    if (!chatId) {
      chatId = newId()
      setActiveChatId(chatId)
    }

    setInput('')

    if (mode === 'image') {
      void generateImage(trimmed, chatId)
      return
    }

    sendMessage({ text: trimmed }, { body: { mode, chatId, language } })
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={startNewChat}
          onSelectChat={selectChat}
          onDeleteChat={removeChat}
          user={user}
          isAdmin={user?.isAdmin ?? false}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              onNewChat={startNewChat}
              onSelectChat={selectChat}
              onDeleteChat={removeChat}
              user={user}
              isAdmin={user?.isAdmin ?? false}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <div className="flex flex-1 items-center justify-between gap-3">
            <ModeTabs value={mode} onChange={setMode} disabled={busy} />
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto">
          {messages.length === 0 ? (
            <Welcome mode={mode} onPick={(t) => submit(t)} />
          ) : (
            <MessageList messages={messages} busy={busy} />
          )}
          {error && (
            <div className="mx-auto w-full max-w-3xl px-4 pb-4">
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-medium">Something went wrong</p>
                <p className="mt-1 text-red-600">{error.message}</p>
              </div>
            </div>
          )}
        </main>

        <div className="border-t border-border bg-background px-4 py-3">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-3 flex justify-center">
              <ChatSearchToggle
                mode={mode}
                onChange={setMode}
                disabled={busy}
              />
            </div>
            <Composer
              input={input}
              setInput={setInput}
              onSubmit={() => submit(input)}
              onStop={stop}
              busy={busy}
              mode={mode}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Kanglei AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
