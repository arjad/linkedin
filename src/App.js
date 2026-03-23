import React, { useState, useEffect } from 'react';

const App = () => {
  const [postData, setPostData] = useState({
    content: 'No post captured yet.',
    authorName: '',
    authorBio: '',
    authorImage: ''
  });

  useEffect(() => {
    const handleMouseOver = (e) => {
      const path = e.composedPath();
      
      let postContainer = null;
      for (const el of path) {
        if (el.getAttribute && (el.getAttribute('componentkey') || (el.className && el.className.includes('feed-shared-update-v2')))) {
          postContainer = el;
          break;
        }
      }

      if (postContainer) {
        const textBox = postContainer.querySelector('[data-testid="expandable-text-box"]') || 
                        postContainer.querySelector('.feed-shared-update-v2__description') ||
                        postContainer.querySelector('.update-components-text');
        
        const authorNameEl = postContainer.querySelector('.update-v2-social-actor__name') || 
                             postContainer.querySelector('span[dir="ltr"] > span > span') ||
                             postContainer.querySelector('.f99d247a._03704b74'); // From user snippet
        
        const authorBioEl = postContainer.querySelector('.update-v2-social-actor__description') ||
                            postContainer.querySelector('.f99d247a._2d22aaeb'); // From user snippet
        
        const authorImgEl = postContainer.querySelector('img.update-v2-social-actor__avatar-image') ||
                            postContainer.querySelector('img[alt*="profile"]');

        const content = textBox ? textBox.innerText : '';
        const authorName = authorNameEl ? authorNameEl.innerText : '';
        const authorBio = authorBioEl ? authorBioEl.innerText : '';
        const authorImage = authorImgEl ? authorImgEl.src : '';

        if (content || authorName) {
          setPostData({
            content: content || postData.content,
            authorName: authorName || postData.authorName,
            authorBio: authorBio || postData.authorBio,
            authorImage: authorImage || postData.authorImage
          });
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [postData]);

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
      }}>
        <div style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
          {postData.content}
        </div>
      </main>

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
