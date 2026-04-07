import { useState, useEffect, useCallback } from 'react';
import { generateAIComment, generateAIDm } from './aiClient.js';
import { AI_MODELS, DEFAULT_MODEL } from './models.js';

export const useCommentGenerator = (postData) => {
  const [notes, setNotes] = useState('');
  const [dmNotes, setDmNotes] = useState('');
  const [tone, setTone] = useState('Professional');
  const [wordCount, setWordCount] = useState('Short');

  const [dmTone, setDmTone] = useState('Engaging');
  const [dmWordCount, setDmWordCount] = useState('Short');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);
  const [isDmLoading, setIsDmLoading] = useState(false);
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
  }, [postData.content, postData.isImagePost, postData.isComment, postData.authorName, postData.authorBio, tone, wordCount, selectedModel]);

  const generateDm = useCallback(async () => {
    if (!postData.content || postData.content === 'Hover over a post or comment to capture...') return;
    
    setIsDmLoading(true);
    setDmNotes('');
    setError(null);

    try {
      await generateAIDm(postData, dmTone, dmWordCount, selectedModel, (content) => {
        setDmNotes(content);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDmLoading(false);
    }
  }, [postData.content, postData.authorName, postData.authorBio, dmTone, dmWordCount, selectedModel]);

  // 1. Initial Capture OR Model Change -> Regenerate Both
  useEffect(() => {
    if (postData.content && postData.content !== 'Hover over a post or comment to capture...') {
      const timer = setTimeout(() => {
        generate();
        generateDm();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [postData.content, selectedModel, generate, generateDm]);

  // 2. Comment Settings Change -> Regenerate ONLY Comment
  useEffect(() => {
    if (postData.content && postData.content !== 'Hover over a post or comment to capture...') {
      const timer = setTimeout(() => {
        generate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tone, wordCount, generate]);

  // 3. DM Settings Change -> Regenerate ONLY DM
  useEffect(() => {
    if (postData.content && postData.content !== 'Hover over a post or comment to capture...') {
      const timer = setTimeout(() => {
        generateDm();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dmTone, dmWordCount, generateDm]);

  return {
    notes,
    setNotes,
    dmNotes,
    setDmNotes,
    tone,
    setTone,
    wordCount,
    setWordCount,
    dmTone,
    setDmTone,
    dmWordCount,
    setDmWordCount,
    selectedModel,
    setSelectedModel,
    isLoading,
    isDmLoading,
    error,
    setError,
    generate,
    generateDm
  };
};


