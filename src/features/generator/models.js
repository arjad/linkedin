export const AI_MODELS = [
  {
    id: 'groq/llama-3.1-8b',
    name: 'Llama 3.1 8B (Groq) - Free',
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    isFree: true,
    description: 'Extreme speed'
  },
  {
    id: 'groq/llama-3.1-70b',
    name: 'Llama 3.1 70B (Groq)',
    provider: 'groq',
    modelId: 'llama-3.1-70b-versatile',
    isFree: false,
    description: 'Fast and powerful'
  },
  {
    id: 'groq/mixtral-8x7b',
    name: 'Mixtral 8x7B (Groq)',
    provider: 'groq',
    modelId: 'mixtral-8x7b-32768',
    isFree: false,
    description: 'High quality'
  },
  {
    id: 'openrouter/gemma-2-9b',
    name: 'Gemma 2 9B (OpenRouter)',
    provider: 'openrouter',
    modelId: 'google/gemma-2-9b-it:free',
    isFree: false,
    description: 'Free via OpenRouter'
  },
  {
    id: 'openrouter/mistral-7b',
    name: 'Mistral 7B (OpenRouter)',
    provider: 'openrouter',
    modelId: 'mistralai/mistral-7b-instruct:free',
    isFree: false,
    description: 'Free via OpenRouter'
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini 1.5 Pro (Google)',
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    isFree: false,
    description: 'Free Tier (API Key needed)'
  }
];

export const DEFAULT_MODEL = AI_MODELS[0];
