export async function handleOpenRouterRequest(systemPrompt, userPrompt, modelId, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "model": modelId,
      "max_tokens": 1000,
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenRouter error response:", errorData);
    throw new Error(errorData.error?.message || `OpenRouter error (${response.status})`);
  }

  const data = await response.json();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*"
    },
    body: data.choices?.[0]?.message?.content || "",
  };
}
