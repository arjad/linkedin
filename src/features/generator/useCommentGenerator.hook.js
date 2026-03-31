import { useState, useEffect, useCallback } from 'react';
import { generateGroqComment } from './groqClient.js';

export const useCommentGenerator = (postData) => {
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState('Professional');
  const [wordCount, setWordCount] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async () => {
    if (!postData.content || postData.content === 'Hover over a post or comment to capture...') return;
    if (!postData.content && !postData.isImagePost) return;

    setIsLoading(true);
    setNotes('');
    setError(null);

    try {
      await generateGroqComment(postData, tone, wordCount, (content) => {
        setNotes(content);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [postData, tone, wordCount]);

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
    isLoading,
    error,
    setError,
    generate
  };
};
