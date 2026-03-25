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
  const [isLoading, setIsLoading] = useState(false);

  // ... handleMouseOver useEffect remains same ...
  useEffect(() => {
    const handleMouseOver = (e) => {
      const path = e.composedPath();

      let postContainer = null;
      for (const el of path) {
        if (!el || !el.getAttribute) continue;

        const componentKey = el.getAttribute('componentkey');
        const isPost = (el.classList && el.classList.contains('feed-shared-update-v2')) || componentKey;

        if (isPost) {
          postContainer = el;
          break;
        }
      }

      if (postContainer) {
        // Find the "Main" container of the post (the large update block)
        const mainUpdate = postContainer.closest('.feed-shared-update-v2') ||
          postContainer.closest('[data-urn]') ||
          postContainer.closest('[data-id]') ||
          postContainer;

        const textBox = mainUpdate.querySelector('[data-testid="expandable-text-box"]') ||
          mainUpdate.querySelector('.feed-shared-update-v2__description') ||
          mainUpdate.querySelector('.update-components-text') ||
          mainUpdate.querySelector('.update-components-article__description');

        // Find the link to the profile, which is usually a good anchor
        const profileLink = mainUpdate.querySelector('a[href*="/in/"]') ||
          mainUpdate.querySelector('a[href*="/company/"]');

        let authorName = '';
        let authorBio = '';
        let authorImage = '';

        if (profileLink) {
          // Try to find name from aria-label of parent or nearby element (very stable)
          const ariaContainer = profileLink.closest('[aria-label*="Profile"]') ||
            profileLink.closest('[aria-label*="profile"]') ||
            profileLink.closest('[aria-label*="Hira Iqbal"]') || // Specific to user snippet
            profileLink.querySelector('[aria-label]');
          
          if (ariaContainer) {
            const label = ariaContainer.getAttribute('aria-label');
            // Extract name: "View Hira Iqbal’s profile" -> "Hira Iqbal"
            authorName = label.replace(/View /i, '').replace(/[\'’]s profile/i, '').replace(/Verified/i, '').split('•')[0].trim();
          }

          // Fallback for name/bio using the obfuscated p tags near the profile link
          const actorSection = profileLink.closest('div');
          if (actorSection) {
            const pTags = actorSection.querySelectorAll('p');
            if (pTags.length > 0 && !authorName) authorName = pTags[0].innerText.trim();
            // The bio is usually the next p tag. In the snippet it's the 3rd p tag if "Verified" is there.
            // Let's look for a longer p tag which is usually the bio.
            for (let i = 1; i < pTags.length; i++) {
                const text = pTags[i].innerText.trim();
                if (text.length > 20 && !text.includes('followers')) {
                    authorBio = text;
                    break;
                }
                if (i === 1 && !authorBio) authorBio = text;
            }
          }

          // Image is usually in the figure inside the profile link or very close
          const imgEl = profileLink.querySelector('img') ||
            mainUpdate.querySelector('img[alt*="profile"]') ||
            mainUpdate.querySelector('img[alt*="View"]');
          if (imgEl) authorImage = imgEl.src;
        }

        // Broadest fallbacks if still missing
        if (!authorName) {
          const nameEl = mainUpdate.querySelector('.update-v2-social-actor__name') ||
            mainUpdate.querySelector('.update-components-actor__name') ||
            mainUpdate.querySelector('.f99d247a._03704b74');
          if (nameEl) authorName = nameEl.innerText.split('\n')[0].trim();
        }

        if (!authorBio) {
          const bioEl = mainUpdate.querySelector('.update-v2-social-actor__description') ||
            mainUpdate.querySelector('.update-components-actor__description') ||
            mainUpdate.querySelector('.f99d247a._2d22aaeb') ||
            mainUpdate.querySelector('p[class*="_8ac8b3c9"]');
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

  const generateComment = async () => {
    if (!postData.content || postData.content === 'No post captured yet.') return;

    setIsLoading(true);
    setNotes(''); // Clear previous notes

    try {
      const chatCompletion = await groq.chat.completions.create({
        "messages": [
          {
            "role": "system",
            "content": "You are a LinkedIn engagement expert. Generate a professional and engaging comment for the following post."
          },
          {
            "role": "user",
            "content": postData.content
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
        maxHeight: '400px'
      }}>
        <div style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
          {postData.content}
        </div>
      </main>

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>
            Generated Comment / Notes
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(notes);
                alert('Copied to clipboard!');
              }}
              style={{
                fontSize: '0.7rem',
                background: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer'
              }}
            >
              Copy 📋
            </button>
            <button
              onClick={generateComment}
              disabled={isLoading}
              style={{
                fontSize: '0.7rem',
                background: isLoading ? '#ccc' : '#0a66c2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: isLoading ? 'default' : 'pointer'
              }}
            >
              {isLoading ? 'Generating...' : 'Magic Comment ✨'}
            </button>
          </div>
        </div>
        <textarea
          placeholder="Type something..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: '100%',
            height: '120px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            padding: '10px',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            resize: 'none',
            boxSizing: 'border-box',
            outline: 'none',
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#000',
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
