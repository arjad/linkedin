import { Groq } from "groq-sdk";

/**
 * Handle Groq API requests
 */
export async function handleGroqRequest(systemPrompt, userPrompt, modelId, apiKey) {
  const groq = new Groq({ apiKey });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: modelId,
    temperature: 0.8,
    max_completion_tokens: 1024,
  });

  return {
    statusCode: 200,
    headers: { 
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*" 
    },
    body: chatCompletion.choices[0]?.message?.content || "",
  };
}
