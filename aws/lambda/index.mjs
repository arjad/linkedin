import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { handleGroqRequest } from "./groqClient.mjs";
import { handleOpenRouterRequest } from "./openrouterClient.mjs";
import { handleGeminiRequest } from "./geminiClient.mjs";

const ssm = new SSMClient({ region: "us-east-1" });

let keysMapping = null;

async function getKeysMapping() {
  if (keysMapping) return keysMapping;

  const command = new GetParameterCommand({
    Name: "/linkedin-assistant/keys",
    WithDecryption: true,
  });

  const response = await ssm.send(command);
  const rawValue = response.Parameter.Value || "";

  // This robust parser handles JSON-like strings OR standard comma-separated key:value lists
  const mapping = {};

  // 1. Remove outermost braces if they exist
  let cleaned = rawValue.trim();
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }

  // 2. Split by commas to handle multiple entries
  const entries = cleaned.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/g); // Splits by comma but ignores commas inside quotes

  for (const entry of entries) {
    const parts = entry.split(/:(.+)/); // Split by first colon only
    if (parts.length >= 2) {
      let key = parts[0].trim().replace(/['"]/g, ''); // Remove all quotes from key
      let val = parts[1].trim().replace(/['"]/g, ''); // Remove all quotes from value
      mapping[key] = val;
    }
  }

  keysMapping = mapping;
  console.log("Successfully loaded mapping for keys:", Object.keys(keysMapping));
  return keysMapping;
}

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { systemPrompt, userPrompt, modelId, id, provider } = body;

  try {
    const mapping = await getKeysMapping();
    const apiKey = mapping[id] || mapping[provider];
    if (!apiKey) {
      console.error(`No key found in mapping for id: ${id} or provider: ${provider}. Available keys:`, Object.keys(mapping));
      throw new Error(`Authentication key not found for ${provider}`);
    }
    console.log("API Key found for:", provider);
    console.log("Provider ID:", id);


    if (provider === 'openrouter') {
      return handleOpenRouterRequest(systemPrompt, userPrompt, modelId, apiKey);
    }

    throw new Error(`Provider ${provider} is not yet implemented in the proxy.`);

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: error.message }),
    };
  }
};




