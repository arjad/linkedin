const PROXY_ENDPOINT = 'https://65tt34qnvkjmlaa5dnaoiaddzi0tmhgs.lambda-url.eu-north-1.on.aws/';
console.log('AI Assistant: Initialized with PROXY_ENDPOINT:', PROXY_ENDPOINT);

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
  console.log('AI Assistant: Routing request to Proxy...');
  return handleProxyRequest(systemPrompt, userPrompt, selectedModel, onChunk);
};


const handleProxyRequest = async (systemPrompt, userPrompt, selectedModel, onChunk) => {
  console.log('AI Assistant: handleProxyRequest starting via Background...');

  return new Promise((resolve, reject) => {
    if (!chrome.runtime?.id) {
      return reject(new Error('Extension context invalidated. Please refresh the page.'));
    }

    try {
      chrome.runtime.sendMessage({
        action: 'proxyRequest',
        endpoint: PROXY_ENDPOINT,
        body: {
          systemPrompt,
          userPrompt,
          modelId: selectedModel.modelId
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('AI Assistant: Background Error:', chrome.runtime.lastError);
          const errMsg = chrome.runtime.lastError.message;
          if (errMsg.includes('Extension context invalidated')) {
            return reject(new Error('Extension context invalidated. Please refresh the page.'));
          }
          return reject(new Error(errMsg));
        }
        if (response && response.success) {
          const data = response.data;
          console.log('AI Assistant: Proxy Response Data:', data);

          let result = [];
          if (data && typeof data === 'object') {
            if (data.responses && Array.isArray(data.responses)) {
              result = data.responses;
            } else if (data.response) {
              result = Array.isArray(data.response) ? data.response : [data.response];
            } else if (data.comment) {
              result = Array.isArray(data.comment) ? data.comment : [data.comment];
            } else if (data.message) {
              result = Array.isArray(data.message) ? data.message : [data.message];
            } else if (data.text) {
              result = Array.isArray(data.text) ? data.text : [data.text];
            } else {
              result = [JSON.stringify(data)];
            }
          } else if (typeof data === 'string') {
            result = [data];
          } else {
            result = [JSON.stringify(data)];
          }

          if (result && result.length > 0) {
            onChunk(result);
            resolve(result);
          } else {
            reject(new Error(data?.message || 'AI request failed'));
          }
        } else {
          reject(new Error(response?.error || 'Unknown proxy error'));
        }
      });
    } catch (err) {
      if (err.message && err.message.includes('Extension context invalidated')) {
        reject(new Error('Extension context invalidated. Please refresh the page.'));
      } else {
        reject(err);
      }
    }
  });
};



const formatError = (error) => {
  let message = 'Something went wrong.';

  const errorStr = error.message || '';
  const errorData = error.response?.data?.error || {};

  if (errorStr.includes('rate_limit_exceeded') || errorData.code === 'rate_limit_exceeded') {
    message = 'Daily limit reached. Try again later.';
  } else if (errorStr.includes('authentication') || errorStr.includes('API key')) {
    message = 'API key error. Check settings.';
  } else if (errorStr.includes('network') || errorStr.includes('fetch')) {
    message = 'Connection failed. Please retry.';
  } else if (errorData.message) {
    message = errorData.message.length < 50 ? errorData.message : 'AI model error.';
  } else if (error.message && error.message.length < 50) {
    message = error.message;
  }

  return new Error(message);
};

