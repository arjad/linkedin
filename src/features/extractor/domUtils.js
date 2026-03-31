/**
 * Utility functions for extracting post and comment data from the LinkedIn DOM.
 */

export const extractProfileData = (profileLink, mainUpdate) => {
  let authorName = '';
  let authorBio = '';
  let authorImage = '';

  if (mainUpdate) {
    const nameEl = mainUpdate.querySelector('.update-components-actor__title') || 
                   mainUpdate.querySelector('.update-v2-social-actor__name');
    if (nameEl) {
      // Get text excluding supplementary info like "Following"
      const mainNameSpan = nameEl.querySelector('.update-components-actor__single-line-truncate') || nameEl;
      authorName = mainNameSpan.innerText.split('•')[0].split('\n')[0].trim();
    }

    const bioEl = mainUpdate.querySelector('.update-components-actor__description') || 
                  mainUpdate.querySelector('.update-v2-social-actor__description');
    if (bioEl) {
      authorBio = bioEl.innerText.trim();
    }
  }

  if (profileLink && (!authorName || !authorBio)) {
    const ariaContainer = profileLink.closest('[aria-label*="Profile"]') || 
                         profileLink.closest('[aria-label*="profile"]') || 
                         profileLink.querySelector('[aria-label]');
    
    if (ariaContainer) {
      const label = ariaContainer.getAttribute('aria-label');
      // Clean up "View:", "View Vadym...", and handle colons/commas
      const cleaned = label.replace(/View:?\s?/i, '').replace(/[\'’]s profile/i, '').replace(/Verified/i, '').trim();
      
      if (!authorName) {
        authorName = cleaned.split('•')[0].split(',')[0].split('|')[0].trim();
        if (authorName.startsWith('View ')) authorName = authorName.replace('View ', '');
      }
    }

    if (!authorBio && profileLink.closest('div')) {
      const actorSection = profileLink.closest('div');
      const pTags = actorSection.querySelectorAll('p, span');
      for (let i = 0; i < pTags.length; i++) {
        const text = pTags[i].innerText.trim();
        if (text.length > 20 && !text.includes('followers') && !text.includes('likes this') && text !== authorName) {
          authorBio = text;
          break;
        }
      }
    }
  }

  if (profileLink && !authorImage) {
    const authorImgEl = profileLink.querySelector('img') || 
                       (mainUpdate && mainUpdate.querySelector('img[alt*="profile"]')) || 
                       (mainUpdate && mainUpdate.querySelector('img[alt*="View"]'));
    if (authorImgEl) authorImage = authorImgEl.src;
  }

  return { authorName, authorBio, authorImage };
};

export const findMainUpdate = (path) => {
  let mainUpdate = null;
  let isComment = false;

  for (const el of path) {
    if (!el || !el.getAttribute) continue;
    if (el.classList && el.classList.contains('comments-comment-entity')) {
      mainUpdate = el;
      isComment = true;
      break;
    }
    const isMainUpdate = (el.classList && el.classList.contains('feed-shared-update-v2')) ||
      el.hasAttribute('data-urn') ||
      el.hasAttribute('data-id');
    if (isMainUpdate) {
      mainUpdate = el;
    }
  }

  // Fallback
  if (!mainUpdate) {
    for (const el of path) {
      if (el.getAttribute && el.getAttribute('componentkey')) {
        mainUpdate = el.closest('.feed-shared-update-v2') || el.closest('.comments-comment-entity') || el.closest('[data-urn]') || el;
        if (mainUpdate && mainUpdate.classList && mainUpdate.classList.contains('comments-comment-entity')) {
          isComment = true;
        }
        break;
      }
    }
  }

  return { mainUpdate, isComment };
};
