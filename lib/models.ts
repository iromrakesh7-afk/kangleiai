export type ModelId = string

// Groq models — using Groq API with GROQ_API_KEY
// Mixtral 8x7b is decommissioned, using Llama 3.3 70b instead
export const CHAT_MODEL = 'llama-3.3-70b-versatile'
export const SEARCH_MODEL = 'llama-3.1-8b-instant'

export const DEFAULT_MODEL: ModelId = CHAT_MODEL

// Image generation using Google Imagen via Vertex AI
export const IMAGE_MODEL = 'google-imagen-3.0-generate-001'

// Supported languages for Kanglei AI
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯀꯤꯇꯩ ꯃꯌꯦꯛ' },
] as const

export const DEFAULT_LANGUAGE = 'en'

export function getModelName(id: string): string {
  return 'Kanglei AI'
}

export type ChatMode = 'chat' | 'search' | 'image'
