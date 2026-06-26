import { CHAT_MODEL, SEARCH_MODEL, SUPPORTED_LANGUAGES, type ChatMode } from '@/lib/models'
import { saveChat } from '@/app/actions/chats'
import type { UIMessage } from 'ai'

export const maxDuration = 60

const BASE_SYSTEM = `You are Kanglei AI, an intelligent and knowledgeable assistant.
Your primary goal is to answer the user's questions accurately, directly, and thoroughly.
- Focus on answering the specific question asked, not on introducing yourself
- Be accurate and factual in all responses
- Use clear, concise language and Markdown formatting for structure and lists
- If a question is outside your knowledge, acknowledge the limitation and provide what you can
- Provide well-researched, helpful answers with relevant details and examples when useful`

const SEARCH_SYSTEM = `${BASE_SYSTEM}
- Provide factual, well-researched answers to the user's question
- Be concise and direct, focusing on what the user asked for
- Include relevant sources or references when applicable
- If the question requires detailed research, provide a comprehensive answer with context`

const LANGUAGE_SYSTEMS: Record<string, string> = {
  en: BASE_SYSTEM,
  mni: `${BASE_SYSTEM}
- You can provide responses in English with Manipuri cultural context when relevant
- When appropriate, mention Manipur, Meitei culture, or local references to enrich your answers
- Always prioritize answering the user's specific question accurately above all else`,
}

export async function POST(req: Request) {
  const {
    messages,
    mode,
    language,
  }: {
    messages: UIMessage[]
    mode?: ChatMode
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

  if (!process.env.GROQ_API_KEY_1) {
    console.error('[v0] GROQ_API_KEY_1 not configured')
    throw new Error('GROQ_API_KEY_1 is not configured')
  }

  const groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue

    let content = ''
    if (m.parts && Array.isArray(m.parts)) {
      for (const part of m.parts) {
        if (part.type === 'text' && 'text' in part) {
          content += (part as any).text
        }
      }
    }

    if (content) {
      groqMessages.push({
        role: m.role,
        content: content,
      })
    }
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      console.error('[v0] Groq API error:', error)
      return new Response(
        JSON.stringify({ error: `Groq API error: ${groqResponse.status}` }),
        { status: groqResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = groqResponse.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let hasStarted = false
          const messageId = `msg_${Date.now()}`

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  continue
                }

                try {
                  const json = JSON.parse(data)
                  const content = json.choices?.[0]?.delta?.content

                  if (!hasStarted && content !== undefined) {
                    controller.enqueue(`data: ${JSON.stringify({ type: 'text-start', id: messageId })}\n\n`)
                    hasStarted = true
                  }
                  
                  if (content && hasStarted) {
                    controller.enqueue(`data: ${JSON.stringify({ type: 'text-delta', id: messageId, delta: content })}\n\n`)
                  }
                } catch (e) {
                  // Skip malformed JSON
                }
              }
            }
          }

          if (hasStarted) {
            controller.enqueue(`data: ${JSON.stringify({ type: 'text-end', id: messageId })}\n\n`)
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(transformedStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
    })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
