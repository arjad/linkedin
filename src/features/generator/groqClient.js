import { Groq } from 'groq-sdk';

// For production, set this to your AWS Lambda/Backend URL
const PROXY_ENDPOINT = process.env.PROXY_ENDPOINT || '';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

import { buildPrompts, buildDmPrompts } from './promptBuilder.js';

export const generateAIComment = async (postData, tone, wordCount, selectedModel, onChunk) => {
  const { systemPrompt, userPrompt } = buildPrompts(postData, tone, wordCount);
  return handleRequest(systemPrompt, userPrompt, selectedModel, onChunk);
};

export const generateAIDm = async (postData, tone, wordCount, selectedModel, onChunk) => {
  const { systemPrompt, userPrompt } = buildDmPrompts(postData, tone, wordCount);
  return handleRequest(systemPrompt, userPrompt, selectedModel, onChunk);
};


const handleRequest = async (systemPrompt, userPrompt, selectedModel, onChunk) => {
  // If we have a proxy endpoint, we route everything through it
  if (PROXY_ENDPOINT) {
    return handleProxyRequest(systemPrompt, userPrompt, selectedModel, onChunk);
  }

  if (selectedModel.provider === 'groq') {
    return handleGroqRequest(systemPrompt, userPrompt, selectedModel.modelId, onChunk);
  } else if (selectedModel.provider === 'openrouter') {
    return handleOpenRouterRequest(systemPrompt, userPrompt, selectedModel.modelId, onChunk);
  } else if (selectedModel.provider === 'google') {
    return handleGoogleRequest(systemPrompt, userPrompt, selectedModel.modelId, onChunk);
  } else {
    throw new Error(`Provider ${selectedModel.provider} is not supported yet.`);
  }
};


const handleProxyRequest = async (systemPrompt, userPrompt, selectedModel, onChunk) => {
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


const handleGoogleRequest = async (systemPrompt, userPrompt, modelId, onChunk) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Google Gemini error");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const parts = chunk.split('}\n{'); 
      for (let part of parts) {
        if (!part.startsWith('{')) part = '{' + part;
        if (!part.endsWith('}')) part = part + '}';
        try {
          const data = JSON.parse(part);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          fullContent += text;
          onChunk(fullContent);
        } catch (e) {}
      }
    }
    return fullContent;
  } catch (error) {
    throw error;
  }
};

const handleGroqRequest = async (systemPrompt, userPrompt, modelId, onChunk) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": userPrompt }
      ],
      "model": modelId,
      "temperature": 0.8,
      "max_completion_tokens": 1024,
      "stream": true,
    });

    let fullContent = '';
    for await (const chunk of chatCompletion) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullContent += delta;
      onChunk(fullContent);
    }
    return fullContent;
  } catch (error) {
    throw formatError(error);
  }
};

const handleOpenRouterRequest = async (systemPrompt, userPrompt, modelId, onChunk) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelId,
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": userPrompt }
        ],
        "stream": true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter error");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.includes('[DONE]')) continue;
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices[0]?.delta?.content || '';
            fullContent += delta;
            onChunk(fullContent);
          } catch (e) {}
        }
      }
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
