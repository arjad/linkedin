const PROXY_ENDPOINT = process.env.PROXY_ENDPOINT || '';

import { buildPrompts, buildDmPrompts } from './promptBuilder.js';
import { handleOpenRouterRequest } from './openrouterClient.js';
import { handleGroqRequest } from './groqRequestClient.js';
import { handleGeminiRequest } from './geminiClient.js';

export const generateAIComment = async (postData, tone, wordCount, selectedModel, onChunk) => {
  const { systemPrompt, userPrompt } = buildPrompts(postData, tone, wordCount);
  return handleRequest(systemPrompt, userPrompt, selectedModel, onChunk);
};

export const generateAIDm = async (postData, tone, wordCount, selectedModel, onChunk) => {
  const { systemPrompt, userPrompt } = buildDmPrompts(postData, tone, wordCount);
  return handleRequest(systemPrompt, userPrompt, selectedModel, onChunk);
};


const handleRequest = async (systemPrompt, userPrompt, selectedModel, onChunk) => {
  // We prioritize the AWS Lambda Proxy to ensure your API keys (from AWS SSM) are kept safe.
  if (PROXY_ENDPOINT && PROXY_ENDPOINT !== 'YOUR_LAMBDA_URL_HERE') {
    return handleProxyRequest(systemPrompt, userPrompt, selectedModel, onChunk);
  }

  // If you are seeing this, it's because either PROXY_ENDPOINT is missing 
  // or it hasn't been configured yet in your .env file.
  if (selectedModel.provider === 'groq') {
    return handleGroqRequest(systemPrompt, userPrompt, selectedModel.modelId, onChunk);
  } else if (selectedModel.provider === 'openrouter') {
    return handleOpenRouterRequest(systemPrompt, userPrompt, selectedModel.modelId, onChunk);
  } else if (selectedModel.provider === 'google') {
    return handleGeminiRequest(systemPrompt, userPrompt, selectedModel.modelId, onChunk);
  } else {
    throw new Error(`Provider ${selectedModel.provider} is not supported yet.`);
  }
};


const handleProxyRequest = async (systemPrompt, userPrompt, selectedModel, onChunk) => {
  if (!PROXY_ENDPOINT) {
    throw new Error('PROXY_ENDPOINT is not configured. Please add it to your .env file and rebuild.');
  }

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        modelId: selectedModel.modelId,
        id: selectedModel.id,
        provider: selectedModel.provider
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Proxy request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullContent += chunk;
      onChunk(fullContent);
    }
    return fullContent;
  } catch (error) {
    throw error;
  }
};






const formatError = (error) => {
  let message = 'An unexpected error occurred.';
  if (error.response?.data?.error?.message) {
    message = error.response.data.error.message;
  } else if (error.message) {
    const jsonMatch = error.message.match(/\{.*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.error?.code === 'rate_limit_exceeded' || parsed.code === 'rate_limit_exceeded') {
          message = 'Rate limit exceeds for today';
        } else if (parsed.error?.message) {
          message = parsed.error.message;
        } else if (parsed.message) {
          message = parsed.message;
        } else {
          message = error.message;
        }
      } catch (e) {
        message = error.message;
      }
    } else if (error.message.includes('Rate limit reached')) {
      message = 'Rate limit exceeds for today';
    } else {
      message = error.message;
    }
  }
  return new Error(message);
};
