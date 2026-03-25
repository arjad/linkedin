import React, { useState, useEffect } from 'react';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for browser usage
});

const App = () => {
  // ... existing state ...
  const [postData, setPostData] = useState({
    content: 'No post captured yet.',
    authorName: '',
    authorBio: '',
    authorImage: ''
  });

  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isLoading, setIsLoading] = useState(false);

  // ... handleMouseOver useEffect remains same ...
  useEffect(() => {
    const handleMouseOver = (e) => {
      const path = e.composedPath();

      // Find the "Main" container of the post (the large update block)
      let mainUpdate = null;
      for (const el of path) {
        if (!el || !el.getAttribute) continue;
        
        const isMainUpdate = (el.classList && el.classList.contains('feed-shared-update-v2')) || 
                             el.hasAttribute('data-urn') || 
                             el.hasAttribute('data-id');
        
        if (isMainUpdate) {
          mainUpdate = el;
          // Keep going up to find the highest update container (in case of nested interactions)
        }
      }

      // Fallback: search for any componentkey if no main update found
      if (!mainUpdate) {
        for (const el of path) {
          if (el.getAttribute && el.getAttribute('componentkey')) {
            mainUpdate = el.closest('.feed-shared-update-v2') || el.closest('[data-urn]') || el;
            break;
          }
        }
      }

      if (mainUpdate) {
        const textBox = mainUpdate.querySelector('[data-testid="expandable-text-box"]') ||
          mainUpdate.querySelector('.feed-shared-update-v2__description') ||
          mainUpdate.querySelector('.update-components-text') ||
          mainUpdate.querySelector('.update-components-article__description');

        // Find the link to the profile, excluding social actions (likes/comments)
        const profileLinks = Array.from(mainUpdate.querySelectorAll('a[href*="/in/"], a[href*="/company/"]'));
        // The real author is usually the first profile link in the update
        const profileLink = profileLinks.find(link => !link.closest('.feed-shared-social-action-bar'));

        let authorName = '';
        let authorBio = '';
        let authorImage = '';

        if (profileLink) {
          const ariaContainer = profileLink.closest('[aria-label*="Profile"]') ||
            profileLink.closest('[aria-label*="profile"]') ||
            profileLink.querySelector('[aria-label]');
          
          if (ariaContainer) {
            const label = ariaContainer.getAttribute('aria-label');
            authorName = label.replace(/View /i, '').replace(/[\'’]s profile/i, '').replace(/Verified/i, '').split('•')[0].split(',')[0].trim();
          }

          const actorSection = profileLink.closest('div');
          if (actorSection) {
            const pTags = actorSection.querySelectorAll('p, span');
            if (pTags.length > 0 && !authorName) authorName = pTags[0].innerText.trim();
            for (let i = 0; i < pTags.length; i++) {
                const text = pTags[i].innerText.trim();
                if (text.length > 20 && !text.includes('followers') && !text.includes('likes this')) {
                    authorBio = text;
                    break;
                }
            }
          }

          const imgEl = profileLink.querySelector('img') ||
            mainUpdate.querySelector('img[alt*="profile"]') ||
            mainUpdate.querySelector('img[alt*="View"]');
          if (imgEl) authorImage = imgEl.src;
        }

        // fallbacks
        if (!authorName) {
          const nameEl = mainUpdate.querySelector('.update-v2-social-actor__name') ||
            mainUpdate.querySelector('.update-components-actor__name') ||
            mainUpdate.querySelector('.f99d247a._03704b74');
          if (nameEl) authorName = nameEl.innerText.split('\n')[0].trim();
        }

        if (!authorBio) {
          const bioEl = mainUpdate.querySelector('.update-v2-social-actor__description') ||
            mainUpdate.querySelector('.update-components-actor__description') ||
            mainUpdate.querySelector('.f99d247a._2d22aaeb');
          if (bioEl) authorBio = bioEl.innerText.trim();
        }

        const content = textBox ? textBox.innerText : '';

        if (content || authorName) {
          console.log('LinkedIn Reader: Captured!', { authorName, authorBio, hasImage: !!authorImage });
          setPostData(prev => ({
            content: content || prev.content,
            authorName: authorName || prev.authorName,
            authorBio: authorBio || prev.authorBio,
            authorImage: authorImage || prev.authorImage
          }));
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [postData]);

  const generateComment = async (contentOverride = null) => {
    const targetContent = contentOverride || postData.content;
    if (!targetContent || targetContent === 'No post captured yet.') return;

    setIsLoading(true);
    setNotes(''); // Clear previous notes

    try {
      const chatCompletion = await groq.chat.completions.create({
        "messages": [
          {
            "role": "system",
            "content": `You are a LinkedIn engagement expert. Generate a ${tone.toLowerCase()} and engaging comment for the following post. 
            Constraints:
            - NO hashtags.
            - Keep it concise (maximum 2-3 sentences).
            - Respond with ONLY the comment text.`
          },
          {
            "role": "user",
            "content": targetContent
          }
        ],
        "model": "openai/gpt-oss-120b",
        "temperature": 1,
        "max_completion_tokens": 8192,
        "top_p": 1,
        "stream": true,
      });

      let fullContent = '';
      for await (const chunk of chatCompletion) {
        const delta = chunk.choices[0]?.delta?.content || '';
        fullContent += delta;
        setNotes(fullContent);
      }
    } catch (error) {
      console.error('Groq Error:', error);
      setNotes('Failed to generate comment. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate when content changes (with basic protection against excessive calls)
  useEffect(() => {
    if (postData.content && postData.content !== 'No post captured yet.') {
        // Prevent re-triggering if the content is the same as what we just generated for
        const timer = setTimeout(() => {
            generateComment();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }
  }, [postData.content, tone]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#333',
      position: 'relative',
    }}>
      <button
        onClick={() => {
          const container = document.getElementById('linkedin-sidebar-extension-root');
          if (container) container.style.display = 'none';
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: '#666',
          zIndex: 10
        }}
      >✕</button>

      <header style={{
        padding: '0 0 15px 0',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#0a66c2' }}>LinkedIn Reader</h1>
      </header>

      {postData.authorName && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '15px',
          padding: '10px',
          background: 'rgba(10, 102, 194, 0.05)',
          borderRadius: '8px',
        }}>
          {postData.authorImage && (
            <img
              src={postData.authorImage}
              style={{ width: '48px', height: '48px', borderRadius: '50%', marginRight: '12px', border: '2px solid #fff' }}
              alt="Author"
            />
          )}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{postData.authorName}</div>
            <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.2' }}>{postData.authorBio}</div>
          </div>
        </div>
      )}

      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #eee',
        maxHeight: '300px'
      }}>
        <div style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
          {postData.content}
        </div>
      </main>

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0a66c2' }}>
              Comment Tone
            </label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                fontSize: '1rem',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #0a66c2',
                outline: 'none',
                cursor: 'pointer',
                background: '#fff',
                color: '#0a66c2',
                fontWeight: 'bold'
              }}
            >
              <option value="Professional">Professional</option>
              <option value="Engaging">Engaging</option>
              <option value="Casual">Casual</option>
              <option value="Funny">Funny</option>
              <option value="Supportive">Supportive</option>
              <option value="Thought-provoking">Thought-provoking</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666' }}>
              AI Generated Comment
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(notes);
                  alert('Copied to clipboard!');
                }}
                style={{
                  fontSize: '0.8rem',
                  background: '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#000'}
                onMouseOut={(e) => e.target.style.background = '#444'}
              >
                Copy 📋
              </button>
              <button
                onClick={() => generateComment()}
                disabled={isLoading}
                style={{
                  fontSize: '0.8rem',
                  background: isLoading ? '#ccc' : '#0a66c2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  cursor: isLoading ? 'default' : 'pointer'
                }}
              >
                {isLoading ? 'Generating..' : 'Regenerate ✨'}
              </button>
            </div>
          </div>
        </div>
        <textarea
          placeholder="AI comment will appear here automatically..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: '100%',
            height: '150px',
            borderRadius: '8px',
            border: '2px solid rgba(10, 102, 194, 0.2)',
            padding: '12px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'none',
            boxSizing: 'border-box',
            outline: 'none',
            background: 'white',
            color: '#000',
            lineHeight: '1.5',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
          }}
        />
      </div>

      <footer style={{
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '0.7rem',
        color: '#999'
      }}>
        LinkedIn Reader v1.1
      </footer>
    </div>
  );
};

export default App;
