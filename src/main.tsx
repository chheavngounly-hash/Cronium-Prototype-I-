import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import './index.css';

declare global {
  interface Window {
    __CRONIUM_MOUNTED__?: boolean;
  }
}

const PRELOAD_RELOAD_KEY = 'cronium_preload_reload_ts';

function attemptStaleChunkRecovery() {
  try {
    const now = Date.now();
    const lastReload = Number(window.sessionStorage.getItem(PRELOAD_RELOAD_KEY) || '0');
    // Guard against reload loops: at most one automatic recovery reload per 30 seconds
    if (!Number.isNaN(lastReload) && now - lastReload < 30_000) {
      return;
    }
    window.sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(now));
  } catch {
    // If sessionStorage is blocked (strict privacy/WebView), avoid blind infinite reloads
    return;
  }
  window.location.reload();
}

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    attemptStaleChunkRecovery();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason?.message || event.reason || '');
    if (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('ChunkLoadError')
    ) {
      attemptStaleChunkRecovery();
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  window.__CRONIUM_MOUNTED__ = true;
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
