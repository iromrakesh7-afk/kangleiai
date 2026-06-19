export type ModelId = string

export interface ModelOption {
  id: ModelId
  name: string
  provider: string
  description: string
}

// Zero-config Gateway providers (OpenAI, Anthropic, Google) — no API key needed.
export const CHAT_MODELS: ModelOption[] = [
  {
    id: 'openai/gpt-5.2',
    name: 'Kanglei Pro',
    provider: 'OpenAI GPT-5.2',
    description: 'Most capable all-round model',
  },
  {
    id: 'anthropic/claude-sonnet-4.6',
    name: 'Kanglei Reason',
    provider: 'Claude Sonnet 4.6',
    description: 'Deep reasoning and long context',
  },
  {
    id: 'google/gemini-3-flash',
    name: 'Kanglei Flash',
    provider: 'Gemini 3 Flash',
    description: 'Fast, efficient responses',
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'Kanglei Lite',
    provider: 'OpenAI GPT-5 mini',
    description: 'Quick everyday answers',
  },
]

export const DEFAULT_MODEL: ModelId = CHAT_MODELS[0].id

// Model with built-in live web access for Perplexity-style search answers.
export const SEARCH_MODEL = 'openai/gpt-4o-mini-search-preview'

// Image generation model (Gateway, zero-config).
export const IMAGE_MODEL = 'openai/gpt-image-1'

export function getModelName(id: string): string {
  return CHAT_MODELS.find((m) => m.id === id)?.name ?? 'Kanglei AI'
}

export type ChatMode = 'chat' | 'search' | 'image'
