import { useState, useEffect } from 'react';
import { findMainUpdate, extractProfileData } from './domUtils.js';

export const usePostExtractor = () => {
  const [postData, setPostData] = useState({
    content: 'Hover over a post or comment to capture...',
    authorName: '',
    authorBio: '',
    authorImage: '',
    isLowContent: false,
    isImagePost: false,
    isComment: false,
    isMessaging: false,
    parentPostContent: '',
    postAuthorName: ''
  });

  const [isMessaging, setIsMessagingMode] = useState(false);

  useEffect(() => {
    const extractMessaging = () => {
      // Robust detection: Check URL and look for the messaging components
      const isMsgUrl = window.location.href.includes('/messaging/');
      const hasMsgList = !!document.querySelector('.msg-s-message-list-content') || !!document.querySelector('.msg-s-message-list');
      const isMsgPage = isMsgUrl && hasMsgList;
      
      setIsMessagingMode(isMsgPage);

      if (!isMsgPage) {
        if (postData.isMessaging) {
          setPostData(prev => ({ ...prev, isMessaging: false }));
        }
        return;
      }

      // Extract Profile from the Messaging context
      const profileCard = document.querySelector('.msg-s-profile-card') || document.querySelector('.msg-convo-wrapper');
      const nameEl = profileCard?.querySelector('.artdeco-entity-lockup__title .truncate') || 
                     document.querySelector('.msg-entity-lockup__entity-title');
      const bioEl = profileCard?.querySelector('.artdeco-entity-lockup__subtitle [title]') || 
                    profileCard?.querySelector('.msg-entity-lockup__entity-info');
      const imgEl = profileCard?.querySelector('.artdeco-entity-lockup__image img') || 
                    document.querySelector('.presence-entity__image');

      // Extract last several messages for thread context
      const messageEls = document.querySelectorAll('.msg-s-event-listitem__body');
      const latestMessages = Array.from(messageEls).slice(-8).map(el => {
        const isOther = el.closest('.msg-s-event-listitem--other');
        return (isOther ? 'Contact: ' : 'Me: ') + el.innerText.trim();
      }).join('\n');

      if (nameEl || latestMessages) {
        setPostData(prev => ({
          ...prev,
          content: latestMessages || prev.content || 'Start of conversation...',
          authorName: nameEl?.innerText.trim() || prev.authorName,
          authorBio: bioEl?.innerText.trim() || bioEl?.getAttribute('title') || prev.authorBio,
          authorImage: imgEl?.src || prev.authorImage,
          isMessaging: true,
          isComment: false
        }));
      }
    };

    extractMessaging();
    const timer = setInterval(extractMessaging, 2000);
    return () => clearInterval(timer);
  }, [window.location.href, postData.isMessaging]);

  useEffect(() => {
    const handleMouseOver = (e) => {
      if (isMessaging) return;
      const path = e.composedPath();
      const { mainUpdate, isComment } = findMainUpdate(path);

      if (mainUpdate) {
        let authorName = '';
        let authorBio = '';
        let authorImage = '';
        let content = '';
        let postImages = [];
        let parentPostContent = '';
        let postAuthorName = '';

        if (isComment) {
          const nameEl = mainUpdate.querySelector('.comments-comment-meta__description-title');
          if (nameEl) {
            authorName = nameEl.innerText.split('•')[0].replace('You', '').trim();
          }
          const bioEl = mainUpdate.querySelector('.comments-comment-meta__description-subtitle');
          if (bioEl) authorBio = bioEl.innerText.trim();
          const imgEl = mainUpdate.querySelector('.comments-comment-meta__image-link img') || mainUpdate.querySelector('img');
          if (imgEl) authorImage = imgEl.src;
          const contentEl = mainUpdate.querySelector('.comments-comment-item__main-content') || mainUpdate.querySelector('.feed-shared-main-content--comment');
          if (contentEl) content = contentEl.innerText.trim();

          const parentPost = mainUpdate.closest('.feed-shared-update-v2') || mainUpdate.closest('[data-urn]');
          if (parentPost) {
            const parentTextBox = parentPost.querySelector('[data-testid="expandable-text-box"]') ||
              parentPost.querySelector('.feed-shared-update-v2__description') ||
              parentPost.querySelector('.update-components-text') ||
              parentPost.querySelector('.update-components-article__description');
            if (parentTextBox) parentPostContent = parentTextBox.innerText.trim();

            const ppProfileLink = parentPost.querySelector('a[href*="/in/"], a[href*="/company/"]');
            const { authorName: ppAuthor } = extractProfileData(ppProfileLink, parentPost);
            postAuthorName = ppAuthor;
          }
        } else {
          const textBox = mainUpdate.querySelector('[data-testid="expandable-text-box"]') ||
            mainUpdate.querySelector('.feed-shared-update-v2__description') ||
            mainUpdate.querySelector('.update-components-text') ||
            mainUpdate.querySelector('.update-components-article__description');
          
          const profileLinks = Array.from(mainUpdate.querySelectorAll('a[href*="/in/"], a[href*="/company/"]'));
          const profileLink = profileLinks.find(link => !link.closest('.feed-shared-social-action-bar'));
          
          const profile = extractProfileData(profileLink, mainUpdate);
          authorName = profile.authorName;
          authorBio = profile.authorBio;
          authorImage = profile.authorImage;

          postImages = Array.from(mainUpdate.querySelectorAll('img')).filter(img => {
            const rect = img.getBoundingClientRect();
            return rect.width > 200 || img.classList.contains('update-components-image__image');
          });
          
          if (!authorName) {
            const nameEl = mainUpdate.querySelector('.update-v2-social-actor__name') || mainUpdate.querySelector('.update-components-actor__name');
            if (nameEl) authorName = nameEl.innerText.split('\n')[0].trim();
          }
          if (!authorBio) {
            const bioEl = mainUpdate.querySelector('.update-v2-social-actor__description') || mainUpdate.querySelector('.update-components-actor__description');
            if (bioEl) authorBio = bioEl.innerText.trim();
          }
          
          content = textBox ? textBox.innerText : '';
          postAuthorName = authorName;
        }

        const isLowContent = content.length > 0 && content.length < 15;
        const isImagePost = (content.length < 50) && postImages.length > 0;

        if (content || authorName || postImages.length > 0) {
          setPostData(prev => ({
            content: content || prev.content,
            authorName: authorName || prev.authorName,
            authorBio: authorBio || prev.authorBio,
            authorImage: authorImage || prev.authorImage,
            isLowContent: isLowContent,
            isImagePost: isImagePost,
            isComment: isComment,
            parentPostContent: parentPostContent || prev.parentPostContent,
            postAuthorName: postAuthorName || prev.postAuthorName
          }));
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  return postData;
};
