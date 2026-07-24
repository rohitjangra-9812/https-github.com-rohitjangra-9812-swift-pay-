import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Capture beforeinstallprompt globally as early as possible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
