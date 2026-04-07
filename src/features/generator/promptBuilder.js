export const buildPrompts = (postData, tone, wordCount) => {
  const wordCountConstraint = {
    'Short': 'absolute maximum 15 words',
    'Medium': 'approximately 30-40 words',
    'Long': 'approximately 60-80 words'
  }[wordCount];

  const systemPrompt = `You are a LinkedIn engagement expert. Your goal is to write a ${tone.toLowerCase()} reply.
          
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
  - Respond with ONLY the text.`;

  const userPrompt = postData.isComment 
    ? `Comment to reply to (by ${postData.authorName}): ${postData.content}`
    : postData.content;

  return { systemPrompt, userPrompt };
};

export const buildDmPrompts = (postData, tone, wordCount) => {
  const wordCountConstraint = {
    'Short': 'max 20 words',
    'Medium': 'approximately 40-50 words',
    'Long': 'approximately 80-100 words'
  }[wordCount];

  const { isMessaging, authorName, content, authorBio } = postData;

  const systemPrompt = isMessaging
    ? `You are a LinkedIn conversation assistant. Your goal is to write a ${tone.toLowerCase()} reply to ${authorName} in an ongoing message thread.
    
    Context: You have access to the recent message history.
    Goal: Continue the conversation naturally, address any questions, or provide the next logical step based on the history.
    
    Format:
    - No need for a formal greeting if the conversation is already flowing.
    - Be concise and relevant to the last messages.
    - End with a question or a call to action if appropriate.`
    : `You are a LinkedIn networking expert. Your goal is to write a personalized, ${tone.toLowerCase()} direct message (DM) to ${authorName} based on their recent post.
    
    The DM should be engaging, professional, and aim to start a conversation.
    
    Format:
    - Start with a personalized greeting like "Hey ${authorName}," or "Hi ${authorName},".
    - Mention something specific from their post.
    - End with a light question or a call to engagement.`;

  const userPrompt = isMessaging
    ? `Contact: ${authorName}
    Bio: ${authorBio || 'N/A'}
    Conversation History (latest messages):
    ${content}`
    : `Person: ${authorName}
    Bio: ${authorBio || 'N/A'}
    Post Content: ${content}`;

  const constraints = `
  Constraints:
  - NO hashtags.
  - Target length: ${wordCountConstraint}.
  - Respond with ONLY the message text.`;

  return { systemPrompt: systemPrompt + constraints, userPrompt };
};


