export const AI_MODELS = [
  {
    id: 'groq/llama-3.1-8b',
    name: 'Grok Llama 3.1 8B (free)',
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    isFree: true,
    description: 'Extreme speed'
  },
  {
    id: 'openrouter/auto-free',
    name: 'OpenRouter Auto (Best Free)',
    provider: 'openrouter',
    modelId: 'openrouter/auto:free',
    isFree: true,
    description: 'Auto-selects best free model'
  },
  {
    id: 'openrouter/gemma-7b',
    name: 'Gemma 7B (free)',
    provider: 'openrouter',
    modelId: 'google/gemma-7b-it:free',
    isFree: true,
    description: 'Reliable free model'
  },
  {
    id: 'groq/llama-3.1-70b',
    name: 'Grok Llama 3.1 70B (Groq)',
    provider: 'groq',
    modelId: 'llama-3.1-70b-versatile',
    isFree: false,
    description: 'Fast and powerful'
  },
  {
    id: 'groq/mixtral-8x7b',
    name: 'Grok Mixtral 8x7B (Groq)',
    provider: 'groq',
    modelId: 'mixtral-8x7b-32768',
    isFree: false,
    description: 'High quality'
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
