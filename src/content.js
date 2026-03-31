import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

const id = 'linkedin-sidebar-extension-root';
let sidebarVisible = false;

function toggleSidebar() {
  const container = document.getElementById(id);
  if (container) {
    sidebarVisible = !sidebarVisible;
    container.style.display = sidebarVisible ? 'block' : 'none';
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'toggleSidebar') {
    toggleSidebar();
  }
});

if (!document.getElementById(id)) {
  const container = document.createElement('div');
  container.id = id;

  // Create shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Create a mounting point for React
  const mountPoint = document.createElement('div');
  mountPoint.id = 'sidebar-mount';
  shadowRoot.appendChild(mountPoint);

  // Inject style into shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    #sidebar-mount {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      border-left: 1px solid rgba(255, 255, 255, 0.3);
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      transition: transform 0.3s ease-in-out;
    }
  `;
  shadowRoot.appendChild(style);

  container.style.display = 'none'; // Initially hidden
  document.body.appendChild(container);

  const root = createRoot(mountPoint);
  root.render(<App />);
}
