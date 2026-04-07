export const handleOpenRouterRequest = async (systemPrompt, userPrompt, modelId, onChunk) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is missing. Please configure PROXY_ENDPOINT in your .env to use secure SSM-based keys.');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelId,
        "max_tokens": 1000,
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
          } catch (e) { }
        }
      }
    }
    return fullContent;
  } catch (error) {
    throw error;
  }
};
