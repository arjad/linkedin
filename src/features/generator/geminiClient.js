export const handleGeminiRequest = async (systemPrompt, userPrompt, modelId, onChunk) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google Gemini API key is missing. Please configure PROXY_ENDPOINT in your .env to use secure SSM-based keys.');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${apiKey}`, {
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
