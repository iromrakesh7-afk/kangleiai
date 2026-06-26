import { CHAT_MODEL, SEARCH_MODEL, SUPPORTED_LANGUAGES, type ChatMode } from '@/lib/models'
import { saveChat } from '@/app/actions/chats'
import {
  convertToModelMessages,
  type UIMessage,
} from 'ai'

export const maxDuration = 60

const BASE_SYSTEM = `You are Kanglei AI, an advanced AI assistant founded by Rakesh Irom from Manipur, India.
You are knowledgeable, warm, and take quiet pride in your Manipuri roots while serving users worldwide.
Be helpful, accurate, and concise. Use Markdown formatting for structure, lists, and code blocks when useful.`

const SEARCH_SYSTEM = `${BASE_SYSTEM}
Provide factual, well-researched answers to the user's question.
Be concise and direct. Finish your answer with a "Sources" section listing key references if applicable.`

const LANGUAGE_SYSTEMS: Record<string, string> = {
  en: BASE_SYSTEM,
  mni: `${BASE_SYSTEM}

NOTE: You are set to Manipuri language mode. Provide responses in English but with Manipuri cultural context and pride.
When relevant, mention Manipur, Meitei culture, and local references to enhance Manipuri identity in your answers.`,
}

export async function POST(req: Request) {
  const {
    messages,
    model,
    mode,
    chatId,
    language,
  }: {
    messages: UIMessage[]
    model?: string
    mode?: ChatMode
    chatId?: string
    language?: string
  } = await req.json()

  const isSearch = mode === 'search'
  const selectedLanguage = language && SUPPORTED_LANGUAGES.some(l => l.code === language) ? language : 'en'
  const selectedModel = isSearch ? SEARCH_MODEL : CHAT_MODEL

  let systemPrompt = isSearch ? SEARCH_SYSTEM : LANGUAGE_SYSTEMS[selectedLanguage] || BASE_SYSTEM
  if (isSearch && selectedLanguage === 'mni') {
    systemPrompt = `${BASE_SYSTEM}
Provide factual, well-researched answers to the user's question.
Be concise and direct. Finish your answer with a "Sources" section listing key references if applicable.

NOTE: You are set to Manipuri language mode. Provide responses in English but with Manipuri cultural context.
When relevant, mention Manipur, Meitei culture, and local references.`
  }

  // Use Groq API with GROQ_API_KEY_1
  if (!process.env.GROQ_API_KEY_1) {
    console.error('[v0] GROQ_API_KEY_1 not configured')
    throw new Error('GROQ_API_KEY_1 is not configured')
  }

  // Build messages array with only role and content - strict Groq format
  const groqMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue

    let content = ''
    if (typeof m.content === 'string') {
      content = m.content
    } else if (Array.isArray(m.content)) {
      content = m.content
        .filter((c) => c && typeof c === 'object' && 'text' in c)
        .map((c) => c.text)
        .join('')
    }

    if (content) {
      groqMessages.push({
        role: m.role,
        content: content,
      })
    }
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY_1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: groqMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal: req.signal,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[v0] Groq error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get response from Groq' }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Stream the response directly without consuming the body
  // The body will be streamed to the client and we won't try to read it
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
