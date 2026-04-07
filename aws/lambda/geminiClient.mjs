/**
 * Handle Google Gemini API requests
 */
export async function handleGeminiRequest(systemPrompt, userPrompt, modelId, apiKey) {
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
    console.error("Gemini error response:", errorData);
    throw new Error(errorData.error?.message || `Google Gemini error (${response.status})`);
  }

  const data = await response.json();
  
  // Handling the response format from Gemini (single result for simplicity in proxy)
  // Note: For streaming, we would need a more complex setup, but proxying simple text for now.
  let text = "";
  if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
    text = data.candidates[0].content.parts[0].text;
  } else if (Array.isArray(data)) {
    // Handle streaming-like array response
    text = data.map(chunk => chunk.candidates?.[0]?.content?.parts?.[0]?.text || "").join("");
  }

  return {
    statusCode: 200,
    headers: { 
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*" 
    },
    body: text,
  };
}
