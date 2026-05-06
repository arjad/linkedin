import React, { useState, useEffect } from 'react';
import { theme, Icons } from './features/ui/theme.js';
import { usePostExtractor } from './features/extractor/usePostExtractor.hook.js';
import { useCommentGenerator } from './features/generator/useCommentGenerator.hook.js';
import { AI_MODELS } from './features/generator/models.js';

const App = () => {
  const postData = usePostExtractor();
  const {
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
    generate,
    generateDm
  } = useCommentGenerator(postData);




  const [copied, setCopied] = useState(false);
  const [dmCopied, setDmCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [activeSettingsTab, setActiveSettingsTab] = useState('about');
  const [toast, setToast] = useState({ visible: false, message: '' });

  const isMessagingMode = window.location.href.includes('/messaging');

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 5000);
  };

  useEffect(() => {
    if (error) {
      const isQuota = error.toLowerCase().includes('limit') || error.toLowerCase().includes('quota');
      const msg = isQuota ? 'model quote reach' : error;
      showToast(`${msg}. retry with ctrl+c to regenerate comment`);
    }
  }, [error]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        generate();
        generateDm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generate, generateDm]);

  const handleCopy = (text, isDm = false) => {
    navigator.clipboard.writeText(text);
    if (isDm) {
      setDmCopied(true);
      setTimeout(() => setDmCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const handleInsert = (text) => {
    const editors = document.querySelectorAll('.ql-editor[contenteditable="true"], [contenteditable="true"]');
    let targetEditor = document.activeElement;
    if (!targetEditor || targetEditor.getAttribute('contenteditable') !== 'true') {
      targetEditor = Array.from(editors).find(ed => ed.offsetParent !== null) || editors[0];
    }
    if (targetEditor) {
      targetEditor.focus();
      document.execCommand('insertText', false, text);
    } else {
      alert("Please click inside a comment or DM box on LinkedIn first.");
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
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: '800',
      letterSpacing: '-0.03em',
      color: theme.colors.text,
      display: 'flex',
      alignItems: 'center',
      paddingTop: '4px',
      paddingBottom: '4px',
      paddingLeft: '4px',
    },
    actionGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    iconBtnSmall: {
      padding: '6px',
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
    closeBtnTop: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      zIndex: 100,
      padding: '4px',
      background: 'rgba(255,255,255,0.8)',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      color: theme.colors.textMuted,
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
      height: 'calc(100% - 60px)',
    },
    card: {
      background: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: '16px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
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
    agentSelect: {
      padding: '4px 24px 4px 8px',
      fontSize: '11px',
      height: '24px',
      width: 'auto',
      minWidth: '100px',
      borderRadius: theme.radius.sm,
      backgroundPosition: 'right 6px center',
      backgroundSize: '12px',
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
    settingsSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    settingsGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    settingsTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: theme.colors.primary,
      borderBottom: `2px solid ${theme.colors.primary}20`,
      paddingBottom: '4px',
      marginBottom: '8px',
    },
    settingsText: {
      fontSize: '13px',
      lineHeight: '1.6',
      color: theme.colors.text,
    },
    statusBadge: {
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '700',
      background: theme.colors.success + '20',
      color: theme.colors.success,
      marginLeft: '8px',
    },
    pricingCard: {
      padding: '16px',
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.surface,
      marginBottom: '16px',
      boxShadow: theme.shadows.sm,
    },
    premiumCard: {
      padding: '16px',
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.accent}30`,
      background: `linear-gradient(160deg, ${theme.colors.surface} 0%, ${theme.colors.accent}05 100%)`,
      position: 'relative',
    },
    settingsTabs: {
      display: 'flex',
      gap: '4px',
      marginBottom: '20px',
      background: theme.colors.primary + '08',
      padding: '4px',
      borderRadius: theme.radius.sm,
      border: `1px solid ${theme.colors.border}`,
    },
    settingsTab: (active) => ({
      flex: 1,
      padding: '8px 4px',
      fontSize: '12px',
      fontWeight: '700',
      textAlign: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s',
      color: active ? '#fff' : theme.colors.textMuted,
      background: active ? theme.colors.primary : 'transparent',
      boxShadow: active ? '0 2px 4px rgba(10, 102, 194, 0.2)' : 'none',
    }),
  };

  const SettingsView = () => (
    <div style={styles.settingsSection}>
      {/* Sub Tabs */}
      <div style={styles.settingsTabs}>
        {['about', 'pricing', 'contact', 'privacy'].map((tab) => (
          <div
            key={tab}
            style={styles.settingsTab(activeSettingsTab === tab)}
            onClick={() => setActiveSettingsTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeSettingsTab === 'about' && (
        <div style={styles.settingsGroup}>
          <div style={styles.settingsTitle}>About Assistant</div>
          <div style={styles.settingsText}>
            LinkedIn AI Assistant is designed to help you engage more effectively with your network using advanced AI models. It captures post context automatically and suggests relevant, professional replies based on your preferred tone.
          </div>
          <div style={{ ...styles.settingsText, marginTop: '12px', fontWeight: '600' }}>
            Contributors:
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Arjad (Lead Developer)</li>
              <li>Groq AI Team</li>
              <li>Open Source Community</li>
            </ul>
          </div>
        </div>
      )}

      {activeSettingsTab === 'privacy' && (
        <div style={styles.settingsGroup}>
          <div style={styles.settingsTitle}>Privacy Policy</div>
          <div style={styles.settingsText}>
            Your data stay yours. We collect post content temporarily to generate replies. We do not store your LinkedIn credentials or personal messages on our servers.
            <br /><br />
            No data is shared with third parties except for the AI processing you explicitly trigger.
          </div>
        </div>
      )}

      {activeSettingsTab === 'pricing' && (
        <div style={styles.settingsGroup}>
          <div style={styles.settingsTitle}>Select Plan</div>

          {/* Free Tier */}
          <div style={styles.pricingCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>Free Tier</span>
              <span style={{ ...styles.statusBadge, marginLeft: 0 }}>Active</span>
            </div>
            <div style={{ ...styles.settingsText, fontSize: '12px', color: theme.colors.textMuted }}>
              Perfect for getting started with AI-powered engagement.
              <ul style={{ margin: '8px 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Standard AI models (Groq, OpenRouter)</li>
                <li>Context-aware post & comment replies</li>
                <li>Basic tone & length controls</li>
              </ul>
            </div>
          </div>

          {/* Premium Tier */}
          <div style={styles.premiumCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: theme.colors.accent }}>Premium</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: '800',
                background: theme.colors.accent,
                color: '#fff',
                textTransform: 'uppercase'
              }}>
                Coming Soon
              </span>
            </div>
            <div style={{ ...styles.settingsText, fontSize: '12px', color: theme.colors.text }}>
              Unlock the full power of professional LinkedIn automation.
              <ul style={{ margin: '8px 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>✅ <b>Interaction History:</b> Keep history of previous comments & DMs per person per interaction</li>
                <li>💬 <b>DM Assistant:</b> Automatically generate smart replies for your LinkedIn DMs</li>
                <li>🚀 <b>Advanced Models:</b> Access to GPT-4o & Claude 3.5 Sonnet</li>
                <li>🎭 <b>Custom Personas:</b> Save and reuse your own unique writing styles</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSettingsTab === 'contact' && (
        <div style={styles.settingsGroup}>
          <div style={styles.settingsTitle}>Contact Us</div>
          <div style={styles.settingsText}>
            For feedback, support, or partnership inquiries, reach out to us:
            <br /><br />
            <a
              href="mailto:devarjad@gmail.com"
              style={{
                color: theme.colors.primary,
                fontWeight: '700',
                textDecoration: 'none',
                background: theme.colors.primary + '10',
                padding: '8px 12px',
                borderRadius: '6px',
                display: 'inline-block'
              }}
            >
              devarjad@gmail.com
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const Toast = ({ visible, message }) => {
    if (!visible) return null;
    return (
      <div style={{
        position: 'fixed',
        top: '60px',
        left: '20px',
        right: '20px',
        padding: '12px 16px',
        background: '#fff5f5',
        color: '#c53030',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: '1px solid #feb2b2',
        borderLeft: `4px solid #f56565`,
        animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ color: '#f56565' }}>
          <Icons.Refresh size={18} />
        </div>
        <div style={{ flex: 1 }}>{message}</div>
      </div>
    );
  };

  const Loader = ({ message }) => (
    <div style={{
      width: '100%',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      background: `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.accent}08)`,
      borderRadius: theme.radius.md,
      border: `1px solid ${theme.colors.primary}20`,
      margin: '12px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.primary, letterSpacing: '0.02em' }}>
          {message || 'Thinking...'}
        </span>
        <div className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
  );


  return (
    <div style={styles.container}>
      {/* Small Absolute Close Button */}
      <button
        style={styles.closeBtnTop}
        onClick={() => {
          const container = document.getElementById('linkedin-sidebar-extension-root');
          if (container) container.style.display = 'none';
        }}
      >
        <Icons.Close size={12} />
      </button>

      <header style={styles.header}>
        <div style={styles.titleWrapper}>
          <span style={styles.headerTitle}>
            {isMessagingMode ? 'Messaging Assista' : 'Comment Assista'}
          </span>
          <img
            src={chrome.runtime.getURL('assets/logo1.png')}
            alt="Comment AI"
            style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <div style={styles.actionGroup}>
          {activeTab === 'main' ? (
            <>
              <button
                style={styles.iconBtnSmall}
                onClick={() => setActiveTab('settings')}
                onMouseOver={(e) => (e.currentTarget.style.background = theme.colors.border)}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                title="Settings"
              >
                <Icons.Settings size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                style={styles.iconBtnSmall}
                onClick={() => setActiveTab('main')}
                title="Go Back"
              >
                <Icons.ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>Settings</span>

            </>
          )}
        </div>
      </header>

      <div style={styles.scrollArea}>
        <Toast visible={toast.visible} message={toast.message} />
        {activeTab === 'main' ? (
          <>
            {/* Post Preview Card - Hide in messaging */}
            {!isMessagingMode && (
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {postData.authorImage ? (
                      <img src={postData.authorImage} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Author" />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme.colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: theme.colors.primary + '15', color: theme.colors.primary }}>
                      {postData.isComment ? 'Reply' : 'Post'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', maxHeight: '120px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}>
                  {postData.content}
                </div>
              </div>
            )}

            {/* Output Area (Comment) - Hide in messaging */}
            {!isMessagingMode && (
              <div style={styles.outputContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>AI Result (Comment)</label>
                  <select
                    style={{ ...styles.select, ...styles.agentSelect }}
                    value={selectedModel.id}
                    onChange={(e) => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value))}
                  >
                    {AI_MODELS.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>

                {/* Comment Specific Controls */}
                <div style={{ ...styles.controlsGrid, marginBottom: '12px', background: theme.colors.primary + '05', padding: '8px', borderRadius: theme.radius.sm }}>
                  <div>
                    <label style={{ ...styles.label, fontSize: '10px' }}>Tone</label>
                    <select style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }} value={tone} onChange={(e) => setTone(e.target.value)}>
                      <option>Professional</option>
                      <option>Engaging</option>
                      <option>Casual</option>
                      <option>Funny</option>
                      <option>Supportive</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ ...styles.label, fontSize: '10px' }}>Length</label>
                    <select style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }} value={wordCount} onChange={(e) => setWordCount(e.target.value)}>
                      <option value="Short">Short</option>
                      <option value="Medium">Medium</option>
                      <option value="Long">Long</option>
                    </select>
                  </div>
                </div>

                {isLoading ? (
                  <Loader message="Crafting the perfect comment..." />
                ) : (
                  <textarea
                    style={{ ...styles.textarea, minHeight: '100px', borderColor: isLoading ? theme.colors.accent + '30' : theme.colors.border }}
                    placeholder="Your AI-powered insight will appear here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                )}
                <div style={styles.actionTray}>
                  <button style={styles.iconBtn} onClick={() => handleCopy(notes)}>
                    <Icons.Copy color={copied ? theme.colors.success : theme.colors.text} size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button style={{ ...styles.iconBtn, background: theme.colors.primary, color: '#fff' }} onClick={() => generate()} disabled={isLoading}>
                    {isLoading ? <Icons.Refresh size={14} className="spin" /> : <Icons.Sparkles size={14} />}
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            {/* DM Section */}
            <div style={{ ...styles.outputContainer, marginTop: isMessagingMode ? '0' : '8px', borderTop: isMessagingMode ? 'none' : `1px solid ${theme.colors.border}`, paddingTop: isMessagingMode ? '0' : '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ ...styles.label, marginBottom: 0, color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isMessagingMode ? 'AI Reply Assistant' : 'Personalized DM'} <span style={{ fontSize: '10px', background: theme.colors.accent, color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: '800' }}>NEW</span>
                </label>
                {isMessagingMode && (
                  <select
                    style={{ ...styles.select, ...styles.agentSelect }}
                    value={selectedModel.id}
                    onChange={(e) => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value))}
                  >
                    {AI_MODELS.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* DM Specific Controls */}
              <div style={{ ...styles.controlsGrid, marginBottom: '12px', background: theme.colors.accent + '05', padding: '8px', borderRadius: theme.radius.sm }}>
                <div>
                  <label style={{ ...styles.label, fontSize: '10px' }}>Tone</label>
                  <select style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }} value={dmTone} onChange={(e) => setDmTone(e.target.value)}>
                    <option>Engaging</option>
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Friendly</option>
                    <option>Curious</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '10px' }}>Length</label>
                  <select style={{ ...styles.select, padding: '6px 10px', fontSize: '12px' }} value={dmWordCount} onChange={(e) => setDmWordCount(e.target.value)}>
                    <option value="Short">Short</option>
                    <option value="Medium">Medium</option>
                    <option value="Long">Long</option>
                  </select>
                </div>
              </div>

              {isDmLoading ? (
                <Loader message="Personalizing your DM..." />
              ) : (
                <textarea
                  style={{ ...styles.textarea, minHeight: '100px', fontSize: '14px', borderColor: isDmLoading ? theme.colors.accent + '30' : theme.colors.border }}
                  placeholder="Personalized DM will appear here..."
                  value={dmNotes}
                  onChange={(e) => setDmNotes(e.target.value)}
                />
              )}
              <div style={styles.actionTray}>
                <button style={styles.iconBtn} onClick={() => handleCopy(dmNotes, true)}>
                  <Icons.Copy color={dmCopied ? theme.colors.success : theme.colors.text} size={14} />
                  {dmCopied ? 'Copied!' : 'Copy'}
                </button>
                <button style={{ ...styles.iconBtn, background: theme.colors.accent, color: '#fff' }} onClick={() => generateDm()} disabled={isDmLoading}>
                  {isDmLoading ? <Icons.Refresh size={14} className="spin" /> : <Icons.Sparkles size={14} />}
                  Regenerate DM
                </button>
              </div>
            </div>


          </>
        ) : (
          <SettingsView />
        )}
      </div>

      <footer style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: theme.colors.textMuted, background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}>
        LinkedIn AI Assistant • v1.0.1 Premium
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        
        .ai-pulse-container { position: relative; width: 60px; height: 60px; display: flex; alignItems: center; justifyContent: center; }
        .ai-pulse-circle { position: absolute; width: 100%; height: 100%; borderRadius: 50%; border: 2px solid ${theme.colors.primary}; animation: ai-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .ai-pulse-circle.accent { border-color: ${theme.colors.accent}; animation-delay: 1s; }
        .ai-pulse-inner { width: 44px; height: 44px; backgroundColor: ${theme.colors.primary}; borderRadius: 50%; display: flex; alignItems: center; justifyContent: center; zIndex: 2; boxShadow: 0 0 20px ${theme.colors.primary}40; }
        
        @keyframes ai-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 0; }
        }

        .loading-dots span {
          animation: loading-dots 1.4s infinite both;
          font-size: 20px;
          color: ${theme.colors.primary};
          margin: 0 1px;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes loading-dots {
          0% { opacity: 0.2; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-3px); }
          100% { opacity: 0.2; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { transform: translateY(-100%) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
