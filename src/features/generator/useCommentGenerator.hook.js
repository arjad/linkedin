import { useState, useEffect, useCallback } from 'react';
import { generateAIComment } from './groqClient.js';
import { AI_MODELS, DEFAULT_MODEL } from './models.js';

export const useCommentGenerator = (postData) => {
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState('Professional');
  const [wordCount, setWordCount] = useState('Medium');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async () => {
    if (!postData.content || postData.content === 'Hover over a post or comment to capture...') return;
    if (!postData.content && !postData.isImagePost) return;

    setIsLoading(true);
    setNotes('');
    setError(null);

    try {
      await generateAIComment(postData, tone, wordCount, selectedModel, (content) => {
        setNotes(content);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [postData, tone, wordCount, selectedModel]);

  useEffect(() => {
    if (postData.content && postData.content !== 'Hover over a post or comment to capture...') {
      const timer = setTimeout(() => {
        generate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [postData.content, tone, wordCount, generate]);

  return {
    notes,
    setNotes,
    tone,
    setTone,
    wordCount,
    setWordCount,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
    setError,
    generate
  };
};
