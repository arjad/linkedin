import { Groq } from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const generateGroqComment = async (postData, tone, wordCount, onChunk) => {
  const wordCountConstraint = {
    'Short': 'absolute maximum 15 words',
    'Medium': 'approximately 30-40 words',
    'Long': 'approximately 60-80 words'
  }[wordCount];

  try {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": `You are a LinkedIn engagement expert. Your goal is to write a ${tone.toLowerCase()} reply.
          
          ${postData.isComment 
            ? `You are REPLYING to a comment made by ${postData.authorName}.
               Context: This comment was left on a post by ${postData.postAuthorName}. 
               Post Author: ${postData.postAuthorName}
               Post Content: "${postData.parentPostContent.substring(0, 300)}..."
               
               IMPORTANT PERSPECTIVE:
               - If the comment you are replying to is praising or encouraging "${postData.postAuthorName}", do NOT say "Thank you" as if YOU are the post author (unless the user explicitly says they are the author).
               - Instead, agree with the commenter or add to the conversation as a community member.
               - If the comment is direct, address the points made by ${postData.authorName}.`
            : `You are COMMENTING on a post by ${postData.authorName}.`
          }
          
          Constraints:
          - NO hashtags.
          - no extra emoji
          - Target length: ${wordCountConstraint}.
          ${postData.isImagePost ? '- The post is primarily an image/visual, so keep the comment relevant to visual content.' : ''}
          - Respond with ONLY the text.`
        },
        {
          "role": "user",
          "content": postData.isComment 
                     ? `Comment to reply to (by ${postData.authorName}): ${postData.content}`
                     : postData.content
        }
      ],
      "model": "openai/gpt-oss-120b",
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
    console.error('Groq Error:', error);
    let message = 'An unexpected error occurred.';
    
    // Try to extract from standard response data
    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message;
    } 
    // Handle case where message is a stringified JSON (common in some SDK errors)
    else if (error.message) {
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
    
    throw new Error(message);
  }
};
