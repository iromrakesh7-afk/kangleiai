export type ModelId = string

export interface ModelOption {
  id: ModelId
  name: string
  provider: string
  description: string
}

// Groq models — using Groq API directly (no Vercel gateway).
// All models are currently active as of June 2026.
export const CHAT_MODELS: ModelOption[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Kanglei Pro',
    provider: 'Groq Llama 3.3 70B',
    description: 'Most capable model, excellent reasoning',
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Kanglei Reason',
    provider: 'Groq Llama 3.1 70B',
    description: 'Large model for complex tasks',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Kanglei Flash',
    provider: 'Groq Llama 3.1 8B',
    description: 'Fast, efficient responses',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Kanglei Lite',
    provider: 'Groq Mixtral 8x7B',
    description: 'Quick everyday answers',
  },
]

export const DEFAULT_MODEL: ModelId = CHAT_MODELS[0].id

// For Groq: use the fastest model for search mode (Llama 3.1 8B Instant).
export const SEARCH_MODEL = 'llama-3.1-8b-instant'

// Image generation using Google Imagen via Vertex AI
export const IMAGE_MODEL = 'google-imagen-3.0-generate-001'

// Supported languages for Kanglei AI
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মণিপুরী' },
] as const

export const DEFAULT_LANGUAGE = 'en'

export function getModelName(id: string): string {
  return CHAT_MODELS.find((m) => m.id === id)?.name ?? 'Kanglei AI'
}

export type ChatMode = 'chat' | 'search' | 'image'
