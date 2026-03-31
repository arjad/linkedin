import React, { useState } from 'react';
import { theme, Icons } from './features/ui/theme.js';
import { usePostExtractor } from './features/extractor/usePostExtractor.hook.js';
import { useCommentGenerator } from './features/generator/useCommentGenerator.hook.js';

const App = () => {
  const postData = usePostExtractor();
  const {
    notes,
    setNotes,
    tone,
    setTone,
    wordCount,
    setWordCount,
    isLoading,
    error,
    generate
  } = useCommentGenerator(postData);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    const editors = document.querySelectorAll('.ql-editor[contenteditable="true"]');
    let targetEditor = document.activeElement;
    if (!targetEditor || !targetEditor.classList.contains('ql-editor')) {
      targetEditor = Array.from(editors).find(ed => ed.offsetParent !== null) || editors[0];
    }
    if (targetEditor) {
      targetEditor.focus();
      document.execCommand('insertText', false, notes);
    } else {
      alert("Please click inside a comment/reply box on LinkedIn first.");
    }
  };

  // --- Styles ---
  const styles = {
    container: {
      height: '100%',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: theme.colors.text,
      background: theme.colors.background,
      overflow: 'hidden',
      position: 'relative',
    },
    header: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      zIndex: 10,
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logo: {
      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
      padding: '8px',
      borderRadius: theme.radius.md,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(10, 102, 194, 0.2)',
    },
    title: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      color: theme.colors.text,
    },
    closeBtn: {
      padding: '8px',
      borderRadius: theme.radius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: theme.colors.textMuted,
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: 'calc(100% - 60px)', // Adjust for header
    },
    card: {
      background: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: '16px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
    },
    authorSection: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      gap: '12px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: theme.radius.full,
      objectFit: 'cover',
      border: `2px solid ${theme.colors.border}`,
    },
    avatarPlaceholder: {
      width: '40px',
      height: '40px',
      borderRadius: theme.radius.full,
      background: theme.colors.border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      padding: '4px 8px',
      borderRadius: theme.radius.sm,
      fontSize: '10px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      background: theme.colors.primary + '15',
      color: theme.colors.primary,
    },
    contentPreview: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: theme.colors.text,
      maxHeight: '120px',
      overflow: 'hidden',
      position: 'relative',
      maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
    },
    controlsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: theme.colors.textMuted,
      marginBottom: '6px',
      display: 'block',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.surface,
      fontSize: '14px',
      color: theme.colors.text,
      cursor: 'pointer',
      outline: 'none',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '16px',
    },
    generateBtn: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: theme.radius.md,
      border: 'none',
      background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600',
      cursor: isLoading ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      transition: 'transform 0.2s, opacity 0.2s',
      opacity: isLoading ? 0.7 : 1,
    },
    outputContainer: {
      position: 'relative',
      marginTop: 'auto',
      paddingBottom: '20px'
    },
    textarea: {
      width: '100%',
      minHeight: '240px',
      padding: '16px',
      borderRadius: theme.radius.md,
      border: `2px solid ${theme.colors.border}`,
      background: theme.colors.surface,
      fontSize: '15px',
      lineHeight: '1.6',
      resize: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
      fontFamily: 'inherit',
    },
    actionTray: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },
    iconBtn: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.surface,
      color: theme.colors.text,
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    primaryIconBtn: {
      flex: 1.5,
      background: theme.colors.primary,
      color: '#fff',
      border: 'none',
    },
    footerStatus: {
      padding: '12px',
      textAlign: 'center',
      fontSize: '11px',
      color: theme.colors.textMuted,
      background: theme.colors.surface,
      borderTop: `1px solid ${theme.colors.border}`,
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleWrapper}>
          <img 
            src={chrome.runtime.getURL('assets/logo2.png')} 
            alt="Comment AI" 
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>
        <button
          onClick={() => {
            const container = document.getElementById('linkedin-sidebar-extension-root');
            if (container) container.style.display = 'none';
          }}
          style={styles.closeBtn}
          onMouseOver={(e) => (e.currentTarget.style.background = theme.colors.border)}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icons.Close />
        </button>
      </header>

      <div style={styles.scrollArea}>
        {/* Post Preview Card */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={styles.authorSection}>
              {postData.authorImage ? (
                <img src={postData.authorImage} style={styles.avatar} alt="Author" />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <Icons.User />
                </div>
              )}
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>{postData.authorName || 'Capturing...'}</div>
                <div style={{ fontSize: '11px', color: theme.colors.textMuted, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {postData.authorBio || 'Target Bio'}
                </div>
              </div>
            </div>
            {postData.content !== 'Hover over a post or comment to capture...' && (
              <span style={styles.badge}>{postData.isComment ? 'Reply' : 'Post'}</span>
            )}
          </div>

          <div style={styles.contentPreview}>
            {postData.content}
          </div>
        </div>

        {/* Configuration */}
        <div style={styles.controlsGrid}>
          <div>
            <label style={styles.label}>Tone</label>
            <select
              style={styles.select}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Professional</option>
              <option>Engaging</option>
              <option>Casual</option>
              <option>Funny</option>
              <option>Supportive</option>
              <option>Thought-provoking</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Length</label>
            <select
              style={styles.select}
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
            >
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          style={styles.generateBtn}
          onClick={() => generate()}
          disabled={isLoading}
          onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {isLoading ? (
            <Icons.Refresh size={20} className="spin" />
          ) : (
            <Icons.Sparkles size={18} color="#fff" />
          )}
          {isLoading ? 'Generating Magic...' : 'Generate New Variation'}
        </button>

        {/* Output Area */}
        <div style={styles.outputContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={styles.label}>AI Result</label>
            {error && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '500' }}>Error: {error}</span>}
          </div>
          <textarea
            style={{
              ...styles.textarea,
              borderColor: isLoading ? theme.colors.accent + '30' : theme.colors.border
            }}
            placeholder="Your AI-powered insight will appear here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div style={styles.actionTray}>
            <button
              style={styles.iconBtn}
              onClick={handleCopy}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <Icons.Copy color={copied ? theme.colors.success : theme.colors.text} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              style={{ ...styles.iconBtn, ...styles.primaryIconBtn, opacity: 0.6, cursor: 'not-allowed' }}
              onClick={() => { }} // Disabled for non-premium
              title="Only for premium members"
            >
              <Icons.PenLine color="#fff" />
              Insert to LinkedIn
            </button>
          </div>
        </div>
      </div>

      <footer style={styles.footerStatus}>
        LinkedIn AI Assistant • v2.2 Premium
      </footer>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}
      </style>
    </div>
  );
};

export default App;
