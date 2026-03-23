chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && tab.url.includes('linkedin.com')) {
    try {
      // Try to send a message
      await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
    } catch (err) {
      // If content script is not injected, inject it now
      console.log('Content script not found, injecting...', err);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // After injection, we might need a small delay or the script itself can handle the initial state
      // Actually, my content.js loads and shows nothing by default.
      // We can send the message again after a short delay
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
      }, 500);
    }
  }
});
