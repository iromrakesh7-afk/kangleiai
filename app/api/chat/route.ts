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

  // Use OpenAI API directly with OPENAI_API_KEY_2
  if (!process.env.OPENAI_API_KEY_2) {
    console.error('[v0] OPENAI_API_KEY_2 not configured')
    throw new Error('OPENAI_API_KEY_2 is not configured')
  }

  const modelMessages = await convertToModelMessages(messages)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY_2}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...modelMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal: req.signal,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[v0] OpenAI error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get response from OpenAI' }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Stream the response and save chat
  if (chatId && response.body) {
    const allMessages = [...messages]
    let fullContent = ''
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    // Start a background task to read and save
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const json = JSON.parse(data)
                const delta = json.choices?.[0]?.delta?.content || ''
                fullContent += delta
              } catch {
                // Ignore JSON parse errors
              }
            }
          }
        }

        if (fullContent) {
          allMessages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: fullContent,
          })
          await saveChat(chatId, allMessages)
        }
      } catch (err) {
        console.log('[v0] Chat save error:', (err as Error).message)
      }
    })()
  }

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
