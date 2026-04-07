import { Groq } from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  // We don't throw here immediately to avoid breaking the build, 
  // but handleGroqRequest will fail if called without a proxy.
  console.warn('Groq API key is missing. Ensure PROXY_ENDPOINT is configured in .env.');
}

const groq = new Groq({
  apiKey: apiKey || 'missing-key',
  dangerouslyAllowBrowser: true 
});

export const handleGroqRequest = async (systemPrompt, userPrompt, modelId, onChunk) => {
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
    throw error;
  }
};
