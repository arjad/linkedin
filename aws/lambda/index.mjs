import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { Groq } from "groq-sdk";

const ssm = new SSMClient({ region: "us-east-1" });

let keysMapping = null;

async function getKeysMapping() {
  if (keysMapping) return keysMapping;
  
  const command = new GetParameterCommand({
    Name: "/linkedin-assistant/keys",
    WithDecryption: true,
  });
  
  const response = await ssm.send(command);
  const rawValue = response.Parameter.Value;

  try {
    // StringList can contain multiple values separated by commas.
    // If the user's mapping is a single string in the list, we take it.
    // However, if the user intended for each entry in the list to be a key:value,
    // we should handle both.
    
    let toParse = rawValue;
    
    // Normalize single quotes to double quotes for JSON.parse
    toParse = toParse
      .replace(/'/g, '"') 
      .replace(/(\w+)\//g, '"$1"/') // Handle provider slashes
      .replace(/:/g, '":') // Handle keys
      .replace(/\{"/g, '{"') // Handle start
      .trim();

    // If it's a simple key:value without braces, wrap it
    if (!toParse.startsWith('{')) {
      toParse = `{${toParse}}`;
    }
    
    keysMapping = JSON.parse(toParse);
  } catch (e) {
    console.error("Failed to parse SSM parameter as JSON. rawValue:", rawValue, "Error:", e);
    keysMapping = {};
  }
  return keysMapping;
}

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { systemPrompt, userPrompt, modelId, id, provider } = body;

  try {
    const mapping = await getKeysMapping();
    
    // The 'id' from models.js (e.g., 'groq/llama-3.1-8b') should be the key in our mapping
    const apiKey = mapping[id]; 
    if (!apiKey) {
      throw new Error(`No API key found for model id: ${id}`);
    }

    if (provider === 'groq') {
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
        body: chatCompletion.choices[0]?.message?.content || "",
      };
    }

    // Add handlers for other providers as needed
    throw new Error(`Provider ${provider} is not yet implemented in the proxy.`);

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
